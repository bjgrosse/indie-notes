export const Roles = { Owner: "owner", Editor: "editor", Viewer: "viewer" };
export type Role = keyof typeof RolePermissions;
export const RolePermissions = {
  owner: {
    canDelete: true,
    canEdit: true,
    canShare: true,
  },
  editor: {
    canDelete: false,
    canEdit: true,
    canShare: false,
  },
  viewer: {
    canDelete: false,
    canEdit: false,
    canShare: false,
  },
};
export const RoleIds = Object.keys(RolePermissions) as Role[];
