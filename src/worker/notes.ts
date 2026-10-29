// The notes, as the API stores and reads them in D1.

export type Note = { id: number; text: string; createdAt: string };

export const MAX_NOTE_LENGTH = 5000;

type NoteRow = { id: number; text: string; created_at: string };

function toNote(row: NoteRow): Note {
  return { id: row.id, text: row.text, createdAt: row.created_at };
}

/** Every note, in the order they were added. */
export async function listNotes(db: D1Database): Promise<Note[]> {
  const { results } = await db
    .prepare("SELECT id, text, created_at FROM notes ORDER BY id")
    .all<NoteRow>();
  return results.map(toNote);
}

/** Saves a note and returns it as stored. */
export async function addNote(db: D1Database, text: string): Promise<Note> {
  const row = await db
    .prepare("INSERT INTO notes (text) VALUES (?) RETURNING id, text, created_at")
    .bind(text)
    .first<NoteRow>();
  if (!row) throw new Error("The database didn't return the new note.");
  return toNote(row);
}
