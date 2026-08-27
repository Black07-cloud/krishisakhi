import apiClient from "./axios";

export const getFarms = () => apiClient.get("/farms");
export const getFarm = (id) => apiClient.get(`/farms/${id}`);
export const createFarm = (payload) => apiClient.post("/farms", payload);
export const updateFarm = (id, payload) => apiClient.patch(`/farms/${id}`, payload);
export const deleteFarm = (id) => apiClient.delete(`/farms/${id}`);
