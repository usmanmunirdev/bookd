import { PromiseHandler, apiHelper } from "../../utils/apiHandler";

const API_URL = import.meta.env.VITE_API_URL;
export const CONTACT_URL = `${API_URL}/contact`;

// Get all contacts (admin-side) with pagination & search
export const getContacts = (params: {
  page?: number;
  limit?: number;
  search?: string;
}) =>
  PromiseHandler(
    apiHelper(
      "get",
      `${CONTACT_URL}?page=${params.page ?? 1}&limit=${params.limit ?? 10}&search=${params.search ?? ""}`,
      null
    )
  );

// Get a single contact by ID
export const getContact = (contactId: string) =>
  PromiseHandler(apiHelper("get", `${CONTACT_URL}/${contactId}`, null));

// Reply to a contact (admin-side)
export const replyContact = (contactId: string, replyData: {
  replySubject: string;
  reply: string;
  repliedBy: string;
}) =>
  PromiseHandler(apiHelper("put", `${CONTACT_URL}/${contactId}/reply`, replyData));

// Delete a contact (admin-side)
export const deleteContact = (contactId: string) =>
  PromiseHandler(apiHelper("delete", `${CONTACT_URL}/${contactId}`, null));
