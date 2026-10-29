import { Hono } from "hono";
import { addNote, listNotes, MAX_NOTE_LENGTH } from "./notes";

// The API, under /api. Everything else is the page Vite builds (wrangler.toml's [assets]).
const app = new Hono<{ Bindings: Env }>().basePath("/api");

app.get("/notes", async (c) => c.json(await listNotes(c.env.DB)));

app.post("/notes", async (c) => {
  const body: unknown = await c.req.json().catch(() => null);
  const raw = body && typeof body === "object" && "text" in body ? body.text : undefined;
  const text = typeof raw === "string" ? raw.trim() : "";
  if (!text) {
    return c.json({ error: "Write something before saving the note." }, 400);
  }
  if (text.length > MAX_NOTE_LENGTH) {
    return c.json({ error: `That note is too long: keep it under ${MAX_NOTE_LENGTH} characters.` }, 400);
  }
  return c.json(await addNote(c.env.DB, text), 201);
});

app.notFound((c) => c.json({ error: "Not found." }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Something went wrong. Please try again." }, 500);
});

export default app;
