import { type FormEvent, useEffect, useState } from "react";
import { fetchNotes, type Note, saveNote } from "./api";

export function App() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes()
      .then(setNotes)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const note = await saveNote(text);
      setNotes((current) => [...(current ?? []), note]);
      setText("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <h1>Notes</h1>

      <form onSubmit={onSubmit}>
        <label htmlFor="new-note">New note</label>
        <textarea
          id="new-note"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />
        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save note"}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>

      {notes === null ? (
        !error && <p>Loading your notes…</p>
      ) : notes.length === 0 ? (
        <p>No notes yet. Write your first one above.</p>
      ) : (
        <ul aria-label="Your notes">
          {notes.map((note) => (
            <li key={note.id}>
              <p>{note.text}</p>
              <time dateTime={note.createdAt}>{new Date(note.createdAt).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
