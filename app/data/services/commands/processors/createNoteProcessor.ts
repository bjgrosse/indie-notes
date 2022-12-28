import { createNote } from "../../../models/note.server";
import type { CommandResult } from "../types";

export default async function processCreateNote(
  text: string,
  userId: string
): Promise<CommandResult> {
  const note = await createNote({ body: text, userId });
  return {
    success: true,
    message: "Created new note",
    content: text,
    recordId: note.id,
  };
}
