import apiClient from "./axios";

export const getSchemes = (params = {}) => {
  const query = new URLSearchParams();
  if (params.category) query.append("category", params.category);
  if (params.state) query.append("state", params.state);
  if (params.level) query.append("level", params.level);
  if (params.search) query.append("search", params.search);
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);

  const queryString = query.toString();
  return apiClient.get(`/schemes${queryString ? `?${queryString}` : ""}`);
};

export const getSchemeFilters = () => apiClient.get("/schemes/filters");

export const getSchemeById = (id) => apiClient.get(`/schemes/${id}`);
