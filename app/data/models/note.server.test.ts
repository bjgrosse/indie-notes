// eslint-disable-next-line jest/no-mocks-import
import { Mock } from "vitest";
import { prisma } from "~/__mocks__/db.server";
import { Role } from "../constants";
import { appendToNote, deleteNote, shareNote, updateNote } from "./note.server";
import { getAcceptableRoles } from "./utilities/permissions";
vi.mock("~/db.server");

function validatePermissionsFilter(mock: Mock, role: Role, userId: string) {
  // @ts-ignore
  const filter = mock?.mock?.calls?.[0]?.[0]?.where;
  expect(filter?.NotePermissions?.some?.role?.in).toEqual(
    getAcceptableRoles(role)
  );
}
const notes = [
  {
    id: "1",
    title: "Shopping List",
    body: "- apples\n- bananas\n- pears",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "1",
  },
  {
    id: "2",
    title: "Sample Note",
    body: "This is some content. \nWith no list.",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "1",
  },
  {
    id: "3",
    title: "Shopping List",
    body: "[ ] apples\n[ ] bananas\n[x] pears",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "3",
  },
];

describe("updateNote", () => {
  it("should require editor permissions", async () => {
    const userId = "1";
    const note = notes[0];
    prisma.note.findMany.mockResolvedValue(notes);
    prisma.note.findFirstOrThrow.mockResolvedValue(note);
    prisma.note.findFirst.mockResolvedValue(note);
    await updateNote({
      id: "1",
      title: "Shopping List",
      body: "oranges, grapes, and kiwi.",
      userId,
    });

    validatePermissionsFilter(prisma?.note?.findFirstOrThrow, "editor", userId);
  });
});

describe("shareNote", () => {
  it("should require owner permissions", async () => {
    const userId = "1";
    const note = notes[0];
    prisma.note.findMany.mockResolvedValue(notes);
    prisma.note.findFirstOrThrow.mockResolvedValue(note);
    prisma.note.findFirst.mockResolvedValue(note);
    await shareNote({
      id: "1",
      email: "test@test.com",
      role: "editor",
      userId,
    });

    validatePermissionsFilter(prisma?.note?.findFirstOrThrow, "owner", userId);
  });
});

describe("deleteNote", () => {
  it("should require owner permissions", async () => {
    const userId = "1";
    const note = notes[0];
    prisma.note.findMany.mockResolvedValue(notes);
    prisma.note.findFirstOrThrow.mockResolvedValue(note);
    prisma.note.findFirst.mockResolvedValue(note);
    await deleteNote({
      id: "1",
      userId,
    });

    validatePermissionsFilter(prisma.note.deleteMany, "owner", userId);
  });
});

describe("appendToNote", () => {
  it("should require editor permissions", async () => {
    const userId = "1";
    const note = notes[0];
    prisma.note.findMany.mockResolvedValue(notes);
    prisma.note.findFirstOrThrow.mockResolvedValue(note);
    prisma.note.findFirst.mockResolvedValue(note);
    await appendToNote({
      id: "1",
      content: "oranges, grapes, and kiwi.",
      userId,
    });

    validatePermissionsFilter(prisma?.note?.findFirstOrThrow, "editor", userId);
  });
  it("should split to list if existing note is bullet pointed", async () => {
    const note = notes[0];
    prisma.note.findMany.mockResolvedValue(notes);
    prisma.note.findFirstOrThrow.mockResolvedValue(note);
    prisma.note.findFirst.mockResolvedValue(note);
    await appendToNote({
      id: "1",
      content: "oranges, grapes, and kiwi.",
      userId: "1",
    });

    expect(prisma.note.update.mock.calls[0][0].data.body).toBe(
      `${note.body}\n- oranges\n- grapes\n- kiwi`
    );
  });
  it("should split to list if existing note is bullet pointed with multi-character designators", async () => {
    const note = notes[2];
    prisma.note.findMany.mockResolvedValue(notes);
    prisma.note.findFirstOrThrow.mockResolvedValue(note);
    prisma.note.findFirst.mockResolvedValue(note);
    await appendToNote({
      id: "1",
      content: "oranges, grapes, and kiwi.",
      userId: "1",
    });

    expect(prisma.note.update.mock.calls[0][0].data.body).toBe(
      `${note.body}\n[ ] oranges\n[ ] grapes\n[ ] kiwi`
    );
  });
  it("should not split to list if existing note has not bullet points", async () => {
    const note = notes[1];
    prisma.note.findMany.mockResolvedValue(notes);
    prisma.note.findFirstOrThrow.mockResolvedValue(note);
    prisma.note.findFirst.mockResolvedValue(note);
    await appendToNote({
      id: "1",
      content: "oranges, grapes, and kiwi.",
      userId: "1",
    });

    expect(prisma.note.update.mock.calls[0][0].data.body).toBe(
      `${note.body}\noranges, grapes, and kiwi.`
    );
  });
});
