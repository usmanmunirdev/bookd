import { PromiseHandler, apiHelper } from "../../utils/apiHandler";

const API_URL = import.meta.env.VITE_API_URL;

export const ROLES_URL = `${API_URL}/roles`;
export const PERMISSIONS_URL = `${API_URL}/permissions`;

// Get all roles
export const getRoles = (page?: number) =>
  PromiseHandler(apiHelper("get", `${ROLES_URL}?page=${page ?? ""}`, null));

// Get all permissions
export const getPermissions = () =>
  PromiseHandler(apiHelper("get", PERMISSIONS_URL, null));

// Get a specific role
export const getRole = (roleId: string) =>
  PromiseHandler(apiHelper("get", `${ROLES_URL}/${roleId}`, null));

// Create a role
export const createRole = (roleData: any) =>
  PromiseHandler(apiHelper("post", ROLES_URL, roleData));

// Update an existing role
export const updateRole = (roleId: string, roleData: any) =>
  PromiseHandler(apiHelper("put", `${ROLES_URL}/${roleId}`, roleData));

// Delete a role by ID
export const deleteRole = (roleId: string) =>
  PromiseHandler(apiHelper("delete", `${ROLES_URL}/${roleId}`, null));
