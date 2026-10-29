import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { MAX_NOTE_LENGTH } from "../shared/note";
import { addNote, listNotes } from "./notes";

const EMPTY = "Write something before saving the note.";
const TOO_LONG = `That note is too long: keep it to ${MAX_NOTE_LENGTH} characters or fewer.`;

// Room for the longest note however it is written: a character sent as two \u
// escapes takes 12 bytes, plus 1 KB for the rest. Anything bigger is refused
// before it is read. It follows MAX_NOTE_LENGTH if that changes.
const MAX_BODY_BYTES = MAX_NOTE_LENGTH * 12 + 1024;

// The API, under /api. Everything else is the page Vite builds (wrangler.toml's [assets]).
const app = new Hono<{ Bindings: Env }>().basePath("/api");

app.get("/notes", async (c) => c.json(await listNotes(c.env.DB)));

app.post(
  "/notes",
  bodyLimit({ maxSize: MAX_BODY_BYTES, onError: (c) => c.json({ error: TOO_LONG }, 413) }),
  async (c) => {
    // Only JSON: a form on another site can't send it, so it can't add notes.
    const mediaType = c.req.header("Content-Type")?.split(";")[0].trim().toLowerCase();
    if (mediaType !== "application/json") {
      return c.json({ error: "Send the note as JSON." }, 415);
    }
    const body: unknown = await c.req.json().catch(() => null);
    const raw = body && typeof body === "object" && "text" in body ? body.text : undefined;
    const text = typeof raw === "string" ? raw.trim() : "";
    // Blank if nothing is left once the invisible characters (zero-width spaces and the like) go.
    if (!text.replace(/\p{Cf}/gu, "").trim()) {
      return c.json({ error: EMPTY }, 400);
    }
    // Counted in characters, so an emoji counts as one.
    if ([...text].length > MAX_NOTE_LENGTH) {
      return c.json({ error: TOO_LONG }, 400);
    }
    return c.json(await addNote(c.env.DB, text), 201);
  },
);

app.notFound((c) => c.json({ error: "Not found." }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Something went wrong. Please try again." }, 500);
});

export default app;
