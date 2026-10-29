import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import type { Note } from "../src/shared/note";
import app from "../src/worker/index";

const EMPTY = { error: "Write something before saving the note." };
const TOO_LONG = { error: "That note is too long: keep it to 5000 characters or fewer." };

function listNotes() {
  return app.request("/api/notes", {}, env);
}

function addNote(body: unknown, contentType = "application/json") {
  return app.request(
    "/api/notes",
    {
      method: "POST",
      headers: { "Content-Type": contentType },
      body: typeof body === "string" ? body : JSON.stringify(body),
    },
    env,
  );
}

async function expectNoNotes() {
  expect(await (await listNotes()).json()).toEqual([]);
}

describe("the notes API", () => {
  it("lists no notes at first", async () => {
    const res = await listNotes();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("adds a note, then lists it", async () => {
    const added = await addNote({ text: "Buy more pencils" });
    expect(added.status).toBe(201);
    const note = (await added.json()) as Note;
    expect(note.text).toBe("Buy more pencils");
    expect(typeof note.id).toBe("number");
    expect(Number.isNaN(Date.parse(note.createdAt))).toBe(false);

    const res = await listNotes();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([note]);
  });

  it("lists notes in the order they were added", async () => {
    await addNote({ text: "First made-up note" });
    await addNote({ text: "Second made-up note" });

    const notes = (await (await listNotes()).json()) as Note[];
    expect(notes.map((n) => n.text)).toEqual(["First made-up note", "Second made-up note"]);
  });

  it("keeps invisible joiners inside a note, as in a family emoji", async () => {
    const family = "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}";
    const added = await addNote({ text: `Made-up note ${family}` });
    expect(added.status).toBe(201);
    expect(((await added.json()) as Note).text).toBe(`Made-up note ${family}`);
  });

  it("trims the spaces around a note's text", async () => {
    const added = await addNote({ text: "  Water the plants \n" });
    expect(((await added.json()) as Note).text).toBe("Water the plants");
  });

  it.each([
    ["blank text", { text: "" }],
    ["only spaces", { text: "   \n\t " }],
    ["only invisible characters", { text: " \u200B\u200D\u2060 " }],
    ["no text at all", {}],
    ["text that isn't words", { text: 42 }],
    ["a body of null", null],
    ["a list instead of a note", [{ text: "Made-up note in a list" }]],
  ])("refuses an empty note (%s) with a plain message", async (_, body) => {
    const res = await addNote(body);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual(EMPTY);
    await expectNoNotes();
  });

  it("refuses a body that isn't valid JSON", async () => {
    const res = await addNote("{not json");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual(EMPTY);
    await expectNoNotes();
  });

  it("refuses a note that isn't sent as JSON", async () => {
    const res = await addNote({ text: "Made-up note sent as a form" }, "text/plain");
    expect(res.status).toBe(415);
    expect(await res.json()).toEqual({ error: "Send the note as JSON." });
    await expectNoNotes();
  });

  it("accepts JSON sent with a charset", async () => {
    const res = await addNote({ text: "Made-up note with a charset" }, "application/json; charset=utf-8");
    expect(res.status).toBe(201);
  });

  it("refuses a note longer than 5000 characters", async () => {
    const res = await addNote({ text: "a".repeat(5001) });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual(TOO_LONG);
    await expectNoNotes();
  });

  it("accepts a note of exactly 5000 characters", async () => {
    const res = await addNote({ text: "a".repeat(5000) });
    expect(res.status).toBe(201);
  });

  it("counts an emoji as one character", async () => {
    const res = await addNote({ text: "\u{1F4DD}".repeat(5000) });
    expect(res.status).toBe(201);
    const tooLong = await addNote({ text: "\u{1F4DD}".repeat(5001) });
    expect(tooLong.status).toBe(400);
  });

  it("refuses a very large request without reading it all", async () => {
    const res = await addNote({ text: "a".repeat(200_000) });
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual(TOO_LONG);
    await expectNoNotes();
  });

  it("answers an unexpected failure with a plain message that gives nothing away", async () => {
    await env.DB.exec("DROP TABLE notes");
    const res = await addNote({ text: "Made-up note for a broken database" });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Something went wrong. Please try again." });
  });

  it("answers an unknown API address with a plain 404", async () => {
    for (const path of ["/api", "/api/nothing-here"]) {
      const res = await app.request(path, {}, env);
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: "Not found." });
    }
  });
});
