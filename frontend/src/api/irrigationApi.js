import apiClient from "./axios";

export const getFarmIrrigation = (farmId) => apiClient.get(`/irrigation/farm/${farmId}`);
export const getManualIrrigation = (params) => {
  const query = new URLSearchParams(params);
  return apiClient.get(`/irrigation/recommendation?${query}`);
};
