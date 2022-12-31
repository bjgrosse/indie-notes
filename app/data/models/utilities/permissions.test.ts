import { catchError } from "~/testUtils";
import { getPermissionsFilter } from "./permissions";

describe("Permissions filters", () => {
  it("filtering for for owner should match owner and correct user id", () => {
    const userId = "1";
    const result = getPermissionsFilter("owner", userId);
    // @ts-expect-error
    expect(result.NotePermissions?.some?.role?.in).toEqual(["owner"]);
    expect(result.NotePermissions?.some?.userId).toEqual(userId);
  });
  it("filtering for editor should match owner or editor", () => {
    const userId = "1";
    const result = getPermissionsFilter("editor", userId);
    // @ts-expect-error
    expect(result.NotePermissions?.some?.role?.in).toEqual(["owner", "editor"]);
  });
  it("filtering for viewer should match owner or editor or viewer", () => {
    const userId = "1";
    const result = getPermissionsFilter("viewer", userId);
    // @ts-expect-error
    expect(result.NotePermissions?.some?.role?.in).toEqual([
      "owner",
      "editor",
      "viewer",
    ]);
  });

  it("getPermissionsFilter should require userId", () => {
    const ex = catchError<Error>(() =>
      //@ts-expect-error
      getPermissionsFilter("viewer")
    );

    expect(ex?.message).toContain("userId is required");
  });
  it("getPermissionsFilter should require role", () => {
    const ex = catchError<Error>(() =>
      //@ts-expect-error
      getPermissionsFilter()
    );

    expect(ex?.message).toContain("role is required");
  });
});
