import { PromiseHandler, apiHelper } from "../../utils/apiHandler";

const API_URL = import.meta.env.VITE_API_URL;

export const PERMISSIONS_URL = `${API_URL}/permissions`;

// Get all permissions
export const getPermissions = (page?: number) =>
  PromiseHandler(apiHelper("get", `${PERMISSIONS_URL}?page=${page ?? ""}`, null));

// Get a specific permission
export const getPermission = (permissionId: string) =>
  PromiseHandler(apiHelper("get", `${PERMISSIONS_URL}/${permissionId}`, null));

// Create a new permission
export const createPermission = (permissionData: any) =>
  PromiseHandler(apiHelper("post", PERMISSIONS_URL, permissionData));

// Update an existing permission
export const updatePermission = (permissionId: string, permissionData: any) =>
  PromiseHandler(apiHelper("put", `${PERMISSIONS_URL}/${permissionId}`, permissionData));

// Delete a permission by ID
export const deletePermission = (permissionId: string) =>
  PromiseHandler(apiHelper("delete", `${PERMISSIONS_URL}/${permissionId}`, null));
