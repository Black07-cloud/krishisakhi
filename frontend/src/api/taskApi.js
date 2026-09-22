import apiClient from "./axios";

export const getTasks = (params = {}) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      query.append(key, params[key]);
    }
  });
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiClient.get(`/tasks${suffix}`);
};

export const getTask = (id) => apiClient.get(`/tasks/${id}`);

export const createTask = (payload) => apiClient.post("/tasks", payload);

export const updateTask = (id, payload) => apiClient.put(`/tasks/${id}`, payload);

export const updateTaskStatus = (id, status) =>
  apiClient.patch(`/tasks/${id}/status`, { status });

export const deleteTask = (id) => apiClient.delete(`/tasks/${id}`);

export const getUpcomingTasks = (days = 7) =>
  apiClient.get(`/tasks/upcoming?days=${days}`);

export const getOverdueTasks = () => apiClient.get("/tasks/overdue");

export const getCompletedTasks = (params = {}) => {
  const query = new URLSearchParams(params);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiClient.get(`/tasks/completed${suffix}`);
};

export const getFarmTasks = (farmId, params = {}) => {
  const query = new URLSearchParams(params);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiClient.get(`/tasks/farm/${farmId}${suffix}`);
};

export const getCropTasks = (cropId, params = {}) => {
  const query = new URLSearchParams(params);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiClient.get(`/tasks/crop/${cropId}${suffix}`);
};

export const getTaskStats = () => apiClient.get("/tasks/stats");

export const runFarmAutomation = (farmId) =>
  apiClient.post(`/tasks/automation/farm/${farmId}`, {});
