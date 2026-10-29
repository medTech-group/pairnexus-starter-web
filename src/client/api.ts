// The page's calls to the Worker's API (src/worker/index.ts). Each failure
// becomes an Error whose message can be shown to the person as it is.
import type { Note } from "../shared/note";

const OFFLINE = "Check your connection and try again.";
const UNKNOWN = "Something went wrong. Please try again.";

/** The answer's JSON, or an Error with a plain message: the server's own, else `failedMessage`. */
async function request<T>(path: string, init: RequestInit | undefined, failedMessage: string): Promise<T> {
  let res: Response;
  let body: unknown;
  try {
    res = await fetch(path, init);
    body = await res.json().catch(() => undefined);
  } catch {
    // The browser's own message ("Failed to fetch") means nothing to a person.
    throw new Error(failedMessage);
  }
  if (!res.ok) {
    const error = (body as { error?: unknown } | undefined)?.error;
    throw new Error(typeof error === "string" ? error : UNKNOWN);
  }
  // A success we can't read (a Wi-Fi sign-in page, say) is treated as no answer at all.
  if (body === undefined) throw new Error(failedMessage);
  return body as T;
}

export async function fetchNotes(): Promise<Note[]> {
  const failed = `Your notes couldn't be loaded. ${OFFLINE}`;
  let notes: Note[];
  try {
    notes = await request<Note[]>("/api/notes", undefined, failed);
  } catch (e) {
    const message = (e as Error).message;
    throw new Error(message === failed ? failed : `Your notes couldn't be loaded. ${message}`);
  }
  // Anything but a list isn't an answer this page can show.
  if (!Array.isArray(notes)) throw new Error(failed);
  return notes;
}

export function saveNote(text: string): Promise<Note> {
  return request<Note>(
    "/api/notes",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    },
    `The note couldn't be saved. ${OFFLINE}`,
  );
}
