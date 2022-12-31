import type { Prisma } from "@prisma/client";
import invariant from "tiny-invariant";
import type { Role } from "~/data/constants";
import { RoleIds } from "~/data/constants";

export function getAcceptableRoles(minimumRole: Role) {
  return RoleIds.slice(0, RoleIds.indexOf(minimumRole) + 1);
}
export function getPermissionsFilter(
  role: Role,
  userId: string
): Prisma.NoteWhereInput {
  invariant(role, "role is required");
  invariant(userId, "userId is required");

  const result: Prisma.NoteWhereInput = {
    NotePermissions: {
      some: {
        role: { in: getAcceptableRoles(role) },
        userId,
      },
    },
  };

  return result;
}
