import apiClient from "./axios";

export const getTasks = (params = {}) => {
  const query = new URLSearchParams(params);
  const suffix = query.toString() ? `?${query}` : "";
  return apiClient.get(`/tasks${suffix}`);
};

export const getTask = (id) => apiClient.get(`/tasks/${id}`);
export const createTask = (payload) => apiClient.post("/tasks", payload);
export const updateTaskStatus = (id, status) => apiClient.patch(`/tasks/${id}/status`, { status });
export const deleteTask = (id) => apiClient.delete(`/tasks/${id}`);
export const runFarmAutomation = (farmId) => apiClient.post(`/tasks/automation/farm/${farmId}`, {});
