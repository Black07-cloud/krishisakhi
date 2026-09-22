import apiClient from "./axios";

export const sendChatMessage = (payload) =>
  apiClient.post("/ai/chat", payload);

export const getAIConversations = () =>
  apiClient.get("/ai/conversations");

export const getAIConversation = (id) =>
  apiClient.get(`/ai/conversations/${id}`);

export const createAIConversation = (payload = {}) =>
  apiClient.post("/ai/conversations", payload);

export const deleteAIConversation = (id) =>
  apiClient.delete(`/ai/conversations/${id}`);
