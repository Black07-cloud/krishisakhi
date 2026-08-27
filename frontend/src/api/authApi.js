import apiClient from "./axios";

export const loginUser = (payload) => apiClient.post("/auth/login", payload);
export const registerUser = (payload) =>
  apiClient.post("/auth/register", payload);
export const getCurrentUser = () => apiClient.get("/auth/me");
