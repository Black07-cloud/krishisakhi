import apiClient from "./axios";

export const createDiseaseScan = (formData) =>
  apiClient.post("/disease/scans", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getDiseaseScans = (params = {}) => {
  const query = new URLSearchParams(params);
  const suffix = query.toString() ? `?${query}` : "";
  return apiClient.get(`/disease/scans${suffix}`);
};

export const getLatestDiseaseScan = (params = {}) => {
  const query = new URLSearchParams(params);
  const suffix = query.toString() ? `?${query}` : "";
  return apiClient.get(`/disease/scans/latest${suffix}`);
};

export const getDiseaseScan = (id) => apiClient.get(`/disease/scans/${id}`);

export const updateDiseaseResult = (id, payload) =>
  apiClient.patch(`/disease/scans/${id}/result`, payload);

export const deleteDiseaseScan = (id) => apiClient.delete(`/disease/scans/${id}`);
