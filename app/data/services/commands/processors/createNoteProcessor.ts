import { createNote } from "../../../models/note.server";
import type { CommandResult } from "../types";

export default async function processCreateNote(
  text: string,
  userId: string
): Promise<CommandResult> {
  await createNote({ body: text, userId });
  return { success: true, message: "success" };
}
