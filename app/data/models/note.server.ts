import type { User, Note } from "@prisma/client";
import { connect } from "http2";
import invariant from "tiny-invariant";

import { prisma } from "~/db.server";
import { Role, Roles } from "../constants";
import { getPermissionsFilter } from "./utilities/permissions";

export type { Note } from "@prisma/client";

export function getNote({
  id,
  userId,
}: Pick<Note, "id"> & {
  userId: User["id"];
}) {
  return prisma.note.findFirst({
    select: { id: true, body: true, title: true },
    where: { id, ...getPermissionsFilter("viewer", userId) },
  });
}
export async function shareNote({
  id,
  email,
  role,
  userId,
}: Pick<Note, "id"> & {
  userId: User["id"];
  email: User["email"];
  role: Role;
}) {
  // check permissions
  await prisma.note.findFirstOrThrow({
    where: { id, ...getPermissionsFilter("owner", userId) },
  });

  return prisma.note.update({
    select: { id: true },
    data: {
      NotePermissions: {
        create: {
          user: { connectOrCreate: { where: { email }, create: { email } } },
          role,
        },
      },
    },
    where: { id },
  });
}

export async function appendToNote({
  id,
  content,
  userId,
}: Pick<Note, "id"> & {
  userId: User["id"];
  content: string;
}) {
  // check permissions
  const note = await prisma.note.findFirstOrThrow({
    where: { id, ...getPermissionsFilter("editor", userId) },
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
    where: { id, ...getPermissionsFilter("editor", userId) },
  });

  return prisma.note.update({
    select: { id: true },
    data: { title, body },
    where: { id },
  });
}

export function getNoteListItems({ userId }: { userId: User["id"] }) {
  return prisma.note.findMany({
    where: { ...getPermissionsFilter("viewer", userId) },
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
      createdBy: {
        connect: {
          id: userId,
        },
      },
      NotePermissions: {
        create: { user: { connect: { id: userId } }, role: Roles.Owner },
      },
    },
  });
}

export function deleteNote({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) {
  return prisma.note.deleteMany({
    where: { id, ...getPermissionsFilter("owner", userId) },
  });
}
