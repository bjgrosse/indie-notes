// eslint-disable-next-line jest/no-mocks-import
import { prisma } from "~/__mocks__/db.server";
import * as Note from "../../../models/note.server";
import processAddTo from "./addToProcessor";

vi.mock("~/db.server");
const appendToNote = vi.spyOn(Note, "appendToNote");
const notes = [
  {
    id: "1",
    title: "Samples Note",
    body: "temp",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "1",
  },
  {
    id: "2",
    title: "Sample Note",
    body: "temp",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "1",
  },
  {
    id: "3",
    title: "Bio List",
    body: "- temp",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "1",
  },
];

describe("addToProcessor", () => {
  it("should detect and find a note", async () => {
    prisma.note.findMany.mockResolvedValue(notes);
    prisma.note.findFirstOrThrow.mockResolvedValue(notes[1]);
    const result = await processAddTo(
      " add to Sample Note, apples, bananas, pears",
      "0"
    );
    expect(result).not.toBeNull();
    expect(result?.success).toBe(true);
    expect(result?.recordId).toBe("2");
    expect(appendToNote).toHaveBeenCalledWith({
      id: "2",
      content: "apples, bananas, pears",
    });
  });

  it("should detect and find a note without case sensitivity", async () => {
    prisma.note.findMany.mockResolvedValue(notes);
    prisma.note.findFirstOrThrow.mockResolvedValue(notes[1]);
    const result = await processAddTo(
      " add to sample Note, apples, bananas, pears",
      "0"
    );
    expect(result).not.toBeNull();
    expect(result?.success).toBe(true);
    expect(result?.recordId).toBe("2");
    expect(appendToNote).toHaveBeenCalledWith({
      id: "2",
      content: "apples, bananas, pears",
    });
  });
  it("should detect and find a note ignoring spaces", async () => {
    prisma.note.findMany.mockResolvedValue(notes);
    prisma.note.findFirstOrThrow.mockResolvedValue(notes[2]);
    const result = await processAddTo(
      " add to BioList, apples, bananas, pears",
      "0"
    );
    expect(result).not.toBeNull();
    expect(result?.success).toBe(true);
    expect(result?.recordId).toBe("3");
    expect(appendToNote).toHaveBeenCalledWith({
      id: "3",
      content: "apples, bananas, pears",
    });
  });
  it("should add to most recently modified note", async () => {
    prisma.note.findMany.mockResolvedValue(notes);
    prisma.note.findFirstOrThrow.mockResolvedValue(notes[1]);
    prisma.note.findFirst.mockResolvedValue(notes[1]);
    const result = await processAddTo(
      " add to last note, apples, bananas, pears",
      "0"
    );

    expect(result).not.toBeNull();
    expect(result?.success).toBe(true);
    expect(result?.recordId).toBe("2");
    expect(appendToNote).toHaveBeenCalledWith({
      id: "2",
      content: "apples, bananas, pears",
    });
  });
});
