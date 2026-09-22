import apiClient from "./axios";

export const createTransaction = (payload) =>
  apiClient.post("/finance/transactions", payload);

export const getTransactions = (params = {}) => {
  const query = new URLSearchParams();
  if (params.farmId) query.append("farmId", params.farmId);
  if (params.cropId) query.append("cropId", params.cropId);
  if (params.type) query.append("type", params.type);
  if (params.category) query.append("category", params.category);
  if (params.paymentMethod) query.append("paymentMethod", params.paymentMethod);
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);

  const queryString = query.toString();
  return apiClient.get(`/finance/transactions${queryString ? `?${queryString}` : ""}`);
};

export const getTransactionById = (id) =>
  apiClient.get(`/finance/transactions/${id}`);

export const updateTransaction = (id, payload) =>
  apiClient.put(`/finance/transactions/${id}`, payload);

export const deleteTransaction = (id) =>
  apiClient.delete(`/finance/transactions/${id}`);

export const getFinanceSummary = (params = {}) => {
  const query = new URLSearchParams();
  if (params.farmId) query.append("farmId", params.farmId);
  if (params.cropId) query.append("cropId", params.cropId);
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);

  const queryString = query.toString();
  return apiClient.get(`/finance/summary${queryString ? `?${queryString}` : ""}`);
};

export const getFarmFinance = (farmId) =>
  apiClient.get(`/finance/farm/${farmId}`);

export const getCropFinance = (cropId) =>
  apiClient.get(`/finance/crop/${cropId}`);
