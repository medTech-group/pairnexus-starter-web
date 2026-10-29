// What the API sends for a note. The Worker (src/worker) and the page
// (src/client) both use it, so a change to the shape is made here once.

export type Note = { id: number; text: string; createdAt: string };

/** The longest note, in characters (an emoji counts as one). */
export const MAX_NOTE_LENGTH = 5000;
