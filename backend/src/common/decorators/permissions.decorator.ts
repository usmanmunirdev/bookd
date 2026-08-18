import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'required_permissions';

export type RequiredPermission = {
  module: string; // e.g., "users", "plans", "roles"
  action: string; // e.g., "view", "add", "edit", "delete"
};

export const RequirePermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
