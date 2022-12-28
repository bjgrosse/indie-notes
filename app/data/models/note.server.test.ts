// eslint-disable-next-line jest/no-mocks-import
import { prisma } from "~/__mocks__/db.server";
import { appendToNote } from "./note.server";
vi.mock("~/db.server");

const notes = [
  {
    id: "1",
    title: "Shopping List",
    body: "- apples\n- bananas\n- pears",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "1",
  },
  {
    id: "2",
    title: "Sample Note",
    body: "This is some content. \nWith no list.",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "1",
  },
  {
    id: "3",
    title: "Shopping List",
    body: "[ ] apples\n[ ] bananas\n[x] pears",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "3",
  },
];
describe("appendToNote", () => {
  it("should split to list if existing note is bullet pointed", async () => {
    const note = notes[0];
    prisma.note.findMany.mockResolvedValue(notes);
    prisma.note.findFirstOrThrow.mockResolvedValue(note);
    prisma.note.findFirst.mockResolvedValue(note);
    await appendToNote({
      id: "1",
      content: "oranges, grapes, and kiwi.",
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
    });

    expect(prisma.note.update.mock.calls[0][0].data.body).toBe(
      `${note.body}\noranges, grapes, and kiwi.`
    );
  });
});
