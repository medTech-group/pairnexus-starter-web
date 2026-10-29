import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import app from "../src/worker/index";

type Note = { id: number; text: string; createdAt: string };

function listNotes() {
  return app.request("/api/notes", {}, env);
}

function addNote(body: unknown) {
  return app.request(
    "/api/notes",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    },
    env,
  );
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

  it("trims the spaces around a note's text", async () => {
    const added = await addNote({ text: "  Water the plants \n" });
    expect(((await added.json()) as Note).text).toBe("Water the plants");
  });

  it.each([
    ["blank text", { text: "" }],
    ["only spaces", { text: "   \n\t " }],
    ["no text at all", {}],
    ["text that isn't words", { text: 42 }],
  ])("refuses an empty note (%s) with a plain message", async (_, body) => {
    const res = await addNote(body);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Write something before saving the note." });
    expect(await (await listNotes()).json()).toEqual([]);
  });

  it("refuses a request that isn't JSON", async () => {
    const res = await addNote("not json");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Write something before saving the note." });
  });

  it("refuses a note longer than 5000 characters", async () => {
    const res = await addNote({ text: "a".repeat(5001) });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "That note is too long: keep it under 5000 characters." });
    expect(await (await listNotes()).json()).toEqual([]);
  });

  it("accepts a note of exactly 5000 characters", async () => {
    const res = await addNote({ text: "a".repeat(5000) });
    expect(res.status).toBe(201);
  });

  it("answers an unknown API address with a plain 404", async () => {
    const res = await app.request("/api/nothing-here", {}, env);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Not found." });
  });
});
