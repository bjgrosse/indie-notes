import type { User, Note } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Note } from "@prisma/client";

export function getNote({
  id,
  userId,
}: Pick<Note, "id"> & {
  userId: User["id"];
}) {
  return prisma.note.findFirst({
    select: { id: true, body: true, title: true },
    where: { id, userId },
  });
}

export async function appendToNote({
  id,
  content,
}: Pick<Note, "id"> & {
  content: string;
}) {
  const note = await prisma.note.findFirstOrThrow({
    select: { id: true, body: true },
    where: { id },
  });

  const lines = note.body.split("\n").filter(Boolean);

  let bullet = lines[lines.length - 1]
    .match(/^(\[[ x-]\])|([^a-zA-Z0-9]+)\s/)
    ?.slice(1)
    ?.find(Boolean);

  if (bullet) {
    if (bullet === "[x]") {
      bullet = "[ ]";
    }
    content =
      bullet + " " + content.replace(/,\s*(and)?\s*/gm, "\n" + bullet + " ");
    content = content.replace(/[^a-zA-Z0-9]*$/gm, "");
  }

  const body = `${note.body}\n${content}`;
  return prisma.note.update({
    select: { id: true, body: true },
    data: { body },
    where: { id },
  });
}

export async function updateNote({
  id,
  body,
  title,
  userId,
}: Pick<Note, "id" | "body" | "title"> & {
  userId: User["id"];
}) {
  const note = await prisma.note.findFirstOrThrow({
    select: { id: true, body: true, title: true },
    where: { id, userId },
  });

  note.title = title;
  note.body = body;
  return prisma.note.update({
    select: { id: true, body: true },
    data: note,
    where: { id },
  });
}

export function getNoteListItems({ userId }: { userId: User["id"] }) {
  return prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true, createdAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createNote({
  body,
  title,
  userId,
}: Pick<Note, "body"> & {
  userId: User["id"];
  title?: string;
}) {
  return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteNote({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) {
  return prisma.note.deleteMany({
    where: { id, userId },
  });
}
