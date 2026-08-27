import apiClient from "./axios";

export const getDashboard = () => apiClient.get("/dashboard");
export const getFarmDashboard = (farmId) => apiClient.get(`/dashboard/farm/${farmId}`);
