import { PromiseHandler, apiHelper } from "../../utils/apiHandler";

const API_URL = import.meta.env.VITE_API_URL;

export const CHAT_AGENT_URL = `${API_URL}/chat-with-agent`;

export const getAllChats = (searchKeyword?: string, page: number = 1, limit: number = 10) =>
  PromiseHandler(
    apiHelper(
      "get",
      `${CHAT_AGENT_URL}/all-chats?search=${searchKeyword ?? ""}&page=${page}&limit=${limit}`,
      null
    )
  );

export const getChat = (chatId: string) =>
  PromiseHandler(apiHelper("get", `${CHAT_AGENT_URL}/thread/${chatId}?side=ADMIN`, null));

export const createChatMessage = (data: any) =>
  PromiseHandler(apiHelper("post", `${CHAT_AGENT_URL}/admin`, data));

export const updateChat = (chatId: string, data: any) =>
  PromiseHandler(apiHelper("put", `${CHAT_AGENT_URL}/${chatId}`, data));

export const deleteChat = (chatId: string) =>
  PromiseHandler(apiHelper("delete", `${CHAT_AGENT_URL}/${chatId}`, null));

export const getChatStats = () =>
  PromiseHandler(apiHelper("get", `${CHAT_AGENT_URL}/stats`, null));

export const getAiStatus = (chatId: string) =>
  PromiseHandler(apiHelper("get", `${CHAT_AGENT_URL}/ai-status/${chatId}`, null));

export const toggleAi = (chatId: string, enabled: boolean) =>
  PromiseHandler(apiHelper("post", `${CHAT_AGENT_URL}/toggle-ai`, { chatId, enabled }));

