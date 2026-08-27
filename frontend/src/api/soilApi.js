import apiClient from "./axios";

export const createSoilRecord = (payload) => apiClient.post("/soil", payload);
export const getSoilRecord = (id) => apiClient.get(`/soil/${id}`);
export const getLatestSoilRecord = (farmId) => apiClient.get(`/soil/farm/${farmId}/latest`);
export const getSoilHistory = (farmId) => apiClient.get(`/soil/farm/${farmId}/history`);
export const getSoilIntelligence = (farmId) => apiClient.get(`/soil/farm/${farmId}/intelligence`);
export const updateSoilRecord = (id, payload) => apiClient.put(`/soil/${id}`, payload);
export const deleteSoilRecord = (id) => apiClient.delete(`/soil/${id}`);
