// The page's calls to the Worker's API (src/worker/index.ts). Each failure
// becomes an Error whose message can be shown to the person as it is.
import type { Note } from "../shared/note";

const OFFLINE = "Check your connection and try again.";

async function request(input: string, init: RequestInit | undefined, offline: string): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    // The browser's own message ("Failed to fetch") means nothing to a person.
    throw new Error(offline);
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: unknown } | null;
    throw new Error(typeof body?.error === "string" ? body.error : "Something went wrong. Please try again.");
  }
  return res;
}

export async function fetchNotes(): Promise<Note[]> {
  const res = await request("/api/notes", undefined, `Your notes couldn't be loaded. ${OFFLINE}`);
  return (await res.json()) as Note[];
}

export async function saveNote(text: string): Promise<Note> {
  const res = await request(
    "/api/notes",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    },
    `The note couldn't be saved. ${OFFLINE}`,
  );
  return (await res.json()) as Note;
}
