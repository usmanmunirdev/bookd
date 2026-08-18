import { PromiseHandler, apiHelper } from "../../utils/apiHandler";

const API_URL = import.meta.env.VITE_API_URL;

export const USERS_URL = `${API_URL}/admin-user`;
export const AUTH_URL = `${API_URL}/admin-user`;

// Get all admin-user
export const getAdminUsers = (page: number, searchKeyword?: string) =>
  PromiseHandler(
    apiHelper(
      "get",
      `${USERS_URL}?page=${page ?? ""}&search=${searchKeyword ?? ""}`,
      null
    )
  );

// Get a specific user
export const getAdminUser = (userId: string) =>
  PromiseHandler(apiHelper("get", `${USERS_URL}/${userId}`, null));

// Create a user
export const createAdminUser = (userData: any) =>
  PromiseHandler(apiHelper("post", USERS_URL, userData));

// Update an existing user
export const updateAdminUser = (userId: string, userData: any) =>
  PromiseHandler(apiHelper("put", `${USERS_URL}/${userId}`, userData));

// Delete a user by ID
export const deleteAdminUser = (userId: string) =>
  PromiseHandler(apiHelper("delete", `${USERS_URL}/${userId}`, null));

// AdminAdminUsers stats
export const getAdminAdminUsersStats = () =>
  PromiseHandler(apiHelper("get", `${USERS_URL}/stats`, null));

// Update current admin profile (cannot change email)
export const updateAdminProfile = (data: { firstName?: string; lastName?: string; phone?: string }) =>
  PromiseHandler(apiHelper("put", `${AUTH_URL}/me/profile`, data));
