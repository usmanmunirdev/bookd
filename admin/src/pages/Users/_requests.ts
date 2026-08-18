import { PromiseHandler, apiHelper } from "../../utils/apiHandler";

const API_URL = import.meta.env.VITE_API_URL;

export const USERS_URL = `${API_URL}/users`;
export const AUTH_URL = `${API_URL}/admin-user`;

// Get all users
export const getUsers = (page: number, searchKeyword?: string) =>
  PromiseHandler(
    apiHelper(
      "get",
      `${USERS_URL}?page=${page ?? ""}&name=${searchKeyword ?? ""}`,
      null
    )
  );

// Get a specific user
export const getUser = (userId: string) =>
  PromiseHandler(apiHelper("get", `${USERS_URL}/${userId}`, null));

// Create a user
export const createUser = (userData: any) =>
  PromiseHandler(apiHelper("post", USERS_URL, userData));

// Update an existing user
export const updateUser = (userId: string, userData: any) =>
  PromiseHandler(apiHelper("put", `${USERS_URL}/${userId}`, userData));

// Delete a user by ID
export const deleteUser = (userId: string) =>
  PromiseHandler(apiHelper("delete", `${USERS_URL}/${userId}`, null));

// Verify token and get user info
export const getUserByToken = (token: string) =>
  PromiseHandler(apiHelper("post", `${AUTH_URL}/verify-token`, { token }));

// Users stats
export const getUsersStats = () =>
  PromiseHandler(apiHelper("get", `${USERS_URL}/stats`, null));

// Update current admin profile (cannot change email)
export const updateAdminProfile = (data: { firstName?: string; lastName?: string; phone?: string }) =>
  PromiseHandler(apiHelper("put", `${AUTH_URL}/me/profile`, data));
