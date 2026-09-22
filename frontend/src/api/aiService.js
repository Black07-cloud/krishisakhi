import apiClient from "./axios";

/**
 * AI Service — placeholder for future /api/ai endpoints.
 * Do NOT call these during initial UI render; invoke only on user action.
 */

/**
 * Send a message to the AI and get a response.
 * @param {string} message - The user's message text
 * @param {string|null} conversationId - Existing conversation ID (or null to start new)
 */
export const sendAIMessage = (message, conversationId = null) =>
  apiClient.post("/ai/message", { message, conversationId });

/**
 * Retrieve an existing conversation history.
 * @param {string} conversationId
 */
export const getAIConversation = (conversationId) =>
  apiClient.get(`/ai/conversation/${conversationId}`);

/**
 * Clear / reset a conversation.
 * @param {string} conversationId
 */
export const clearAIConversation = (conversationId) =>
  apiClient.delete(`/ai/conversation/${conversationId}`);

/**
 * Get all conversations for the current user.
 */
export const getAIConversations = () => apiClient.get("/ai/conversations");
