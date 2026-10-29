import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { MAX_NOTE_LENGTH, type Note } from "../shared/note";
import { fetchNotes, saveNote } from "./api";

export function App() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const textBox = useRef<HTMLTextAreaElement>(null);

  // Only the latest load is shown, so an older, slower answer can't hide a note just saved.
  const latestLoad = useRef(0);
  const loadNotes = useCallback(async () => {
    const load = ++latestLoad.current;
    try {
      const loaded = await fetchNotes();
      if (load !== latestLoad.current) return;
      setNotes(loaded);
      setLoadError(null);
    } catch (e) {
      if (load !== latestLoad.current) return;
      const message = (e as Error).message;
      setLoadError(message.startsWith("Your notes") ? message : `Your notes couldn't be loaded. ${message}`);
    }
  }, []);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await saveNote(text);
      setText("");
      setSaved(true);
      await loadNotes();
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
      // Ready for the next note, for keyboard users too: the button was disabled while saving.
      textBox.current?.focus();
    }
  }

  return (
    <main>
      <h1>Notes</h1>

      <form onSubmit={onSubmit}>
        <label htmlFor="new-note">New note</label>
        <textarea
          id="new-note"
          ref={textBox}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSaved(false);
          }}
          readOnly={saving}
          maxLength={MAX_NOTE_LENGTH}
          rows={3}
        />
        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save note"}
        </button>
        {saveError && <p role="alert">{saveError}</p>}
        <p role="status">{saved ? "Note saved." : ""}</p>
      </form>

      {loadError ? (
        <p role="alert">{loadError}</p>
      ) : notes === null ? (
        <p>Loading your notes…</p>
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
