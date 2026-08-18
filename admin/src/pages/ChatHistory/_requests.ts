import { PromiseHandler, apiHelper } from "../../utils/apiHandler";

const API_URL = import.meta.env.VITE_API_URL;

export const BOOKING_LOGS_URL = `${API_URL}/chat/all`;

// Get all booking-logs
export const getChatHistory = (page: number, searchKeyword?: string) =>
  PromiseHandler(
    apiHelper(
      "get",
      `${BOOKING_LOGS_URL}?page=${page ?? ""}&search=${searchKeyword ?? ""}`,
      null
    )
  );

