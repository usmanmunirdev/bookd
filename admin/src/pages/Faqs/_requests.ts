import { PromiseHandler, apiHelper } from "../../utils/apiHandler";

const API_URL = import.meta.env.VITE_API_URL;

export const FAQ_URL = `${API_URL}/faq`;
export const FAQ_CATEGORY_URL = `${API_URL}/faq/category`;

// ---------------- CATEGORY ----------------

// Get all categories
export const getFaqCategories = () =>
  PromiseHandler(apiHelper("get", FAQ_CATEGORY_URL, null));

// Get single category
export const getFaqCategory = (categoryId: string) =>
  PromiseHandler(apiHelper("get", `${FAQ_CATEGORY_URL}/${categoryId}`, null));

// Create category
export const createFaqCategory = (categoryData: any) =>
  PromiseHandler(apiHelper("post", FAQ_CATEGORY_URL, categoryData));

// Update category
export const updateFaqCategory = (categoryId: string, categoryData: any) =>
  PromiseHandler(
    apiHelper("patch", `${FAQ_CATEGORY_URL}/${categoryId}`, categoryData)
  );

// Delete category
export const deleteFaqCategory = (categoryId: string) =>
  PromiseHandler(
    apiHelper("delete", `${FAQ_CATEGORY_URL}/${categoryId}`, null)
  );

// ---------------- FAQ ----------------

// Get all FAQs (pagination + search + category filter)
export const getFaqs = (params: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}) =>
  PromiseHandler(
    apiHelper(
      "get",
      `${FAQ_URL}?page=${params.page ?? 1}&limit=${params.limit ?? 10}&search=${params.search ?? ""}${params.categoryId ? `&categoryId=${params.categoryId}` : ""
      }`,
      null
    )
  );

// Get single FAQ
export const getFaq = (faqId: string) =>
  PromiseHandler(apiHelper("get", `${FAQ_URL}/${faqId}`, null));

// Create FAQ
export const createFaq = (faqData: any) =>
  PromiseHandler(apiHelper("post", FAQ_URL, faqData));

// Update FAQ
export const updateFaq = (faqId: string, faqData: any) =>
  PromiseHandler(apiHelper("patch", `${FAQ_URL}/${faqId}`, faqData));

// Delete FAQ
export const deleteFaq = (faqId: string) =>
  PromiseHandler(apiHelper("delete", `${FAQ_URL}/${faqId}`, null));
