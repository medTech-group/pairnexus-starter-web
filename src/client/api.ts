// The page's calls to the Worker's API (src/worker/index.ts).

export type Note = { id: number; text: string; createdAt: string };

async function errorMessage(res: Response): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: unknown } | null;
  return typeof body?.error === "string" ? body.error : "Something went wrong. Please try again.";
}

export async function fetchNotes(): Promise<Note[]> {
  const res = await fetch("/api/notes");
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as Note[];
}

export async function saveNote(text: string): Promise<Note> {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as Note;
}
