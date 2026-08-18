// src/admin/termsPrivacy/_requests.ts
import { PromiseHandler, apiHelper } from "../../utils/apiHandler";

const API_URL = import.meta.env.VITE_API_URL;

export const TERMS_URL = `${API_URL}/policies/terms`;
export const PRIVACY_URL = `${API_URL}/policies/privacy`;

export const getTerms = () => PromiseHandler(apiHelper("get", TERMS_URL, null));

export const createTerm = (data: any) =>
  PromiseHandler(apiHelper("post", TERMS_URL, data));

export const updateTerm = (id: string, data: any) =>
  PromiseHandler(apiHelper("put", `${TERMS_URL}/${id}`, data));

export const getPrivacy = () => PromiseHandler(apiHelper("get", PRIVACY_URL, null));

export const createPrivacy = (data: any) =>
  PromiseHandler(apiHelper("post", PRIVACY_URL, data));

export const updatePrivacy = (id: string, data: any) =>
  PromiseHandler(apiHelper("put", `${PRIVACY_URL}/${id}`, data));
