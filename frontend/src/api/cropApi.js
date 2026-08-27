import apiClient from "./axios";

export const getCrops = () => apiClient.get("/crops");
export const getCropsByFarm = (farmId) => apiClient.get(`/crops/farm/${farmId}`);
export const getCrop = (id) => apiClient.get(`/crops/${id}`);
export const createCrop = (payload) => apiClient.post("/crops", payload);
export const updateCrop = (id, payload) => apiClient.put(`/crops/${id}`, payload);
export const deleteCrop = (id) => apiClient.delete(`/crops/${id}`);
export const updateCropStage = (id, currentStage) =>
  apiClient.patch(`/crops/${id}/stage`, { currentStage });
export const getCropLifecycle = (id) => apiClient.get(`/crops/${id}/lifecycle`);
