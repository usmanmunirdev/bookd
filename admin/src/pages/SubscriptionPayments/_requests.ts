import { PromiseHandler, apiHelper } from "../../utils/apiHandler";

const API_URL = import.meta.env.VITE_API_URL;
export const SUBSCRIPTION_URL = `${API_URL}/subscription/payment-history`;

export const getSubscriptions = (params: {
  page?: number;
  limit?: number;
  startDate?: any;
  endDate?: any;
  userId?: string;
  isSuccess?: string;
  search?: string;
}) =>
  PromiseHandler(
    apiHelper(
      "get",
      `${SUBSCRIPTION_URL}?page=${params.page ?? 1}&limit=${params.limit ?? 10}&startDate=${params.startDate ?? ""}&endDate=${params.endDate ?? ""}&userId=${params.userId ?? ""}&isSuccess=${params.isSuccess ?? ""}&search=${params.search ?? ""}`,
      null
    )
  );
