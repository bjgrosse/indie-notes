import { prisma } from "~/db.server";
import type { Note } from "../../../models/note.server";
import { appendToNote } from "../../../models/note.server";
import type { CommandResult } from "../types";

export default async function processAddTo(
  text: string,
  userId: string
): Promise<CommandResult | undefined> {
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim();

  if (normalized.startsWith("add to")) {
    const remainder = normalized.slice(6).trim();
    let targetNote: Pick<Note, "id" | "title"> | null | undefined;
    let noteDesignator: string | null | undefined;
    if (remainder.startsWith("last note")) {
      targetNote = await prisma.note.findFirst({
        select: { id: true, title: true },
        orderBy: { createdAt: "desc" },
        where: { userId },
      });
      noteDesignator = "last note";
    } else if (remainder.startsWith("last ")) {
      targetNote = await prisma.note.findFirst({
        select: { id: true, title: true },
        orderBy: { createdAt: "desc" },
        where: { userId },
      });
      noteDesignator = "last ";
    } else {
      const [firstWord] = remainder.split(" ");
      const notes = await prisma.note.findMany({
        // where: { title: { startsWith: firstWord } },

        where: { userId },
        select: { id: true, title: true },
        orderBy: { updatedAt: "desc" },
      });

      const TRIMMED_CHARS = /[^a-zA-Z0-9]/g;
      targetNote = notes.find(
        (note) =>
          note.title &&
          remainder
            .replace(TRIMMED_CHARS, "")
            .startsWith(note.title.replace(TRIMMED_CHARS, "").toLowerCase())
      );

      noteDesignator = targetNote?.title;
    }

    if (targetNote) {
      const content = text.replace(
        new RegExp(`^.*?${noteDesignator}[^a-zA-Z0-9]*`, "gi"),
        ""
      );
      appendToNote({ id: targetNote.id, content });

      return {
        success: true,
        message: `Added to ${targetNote.title || "last note"}`,
        content,
        recordId: targetNote.id,
      };
    }

    return {
      success: false,
      message: "Could not find matching note.",
    };
  }

  return undefined;
}
