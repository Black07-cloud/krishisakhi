import apiClient from "./axios";

// Market Intelligence API
export const getTodayMarketPrices = (params = {}) => {
  const query = new URLSearchParams();
  if (params.crop) query.append("crop", params.crop);
  if (params.state) query.append("state", params.state);
  if (params.district) query.append("district", params.district);
  if (params.market) query.append("market", params.market);
  if (params.limit) query.append("limit", params.limit);
  const q = query.toString();
  return apiClient.get(`/market/today${q ? `?${q}` : ""}`);
};

export const getMarketPrices = (params = {}) => {
  const query = new URLSearchParams();
  if (params.crop) query.append("crop", params.crop);
  if (params.state) query.append("state", params.state);
  if (params.district) query.append("district", params.district);
  if (params.market) query.append("market", params.market);
  if (params.limit) query.append("limit", params.limit);
  const q = query.toString();
  return apiClient.get(`/market${q ? `?${q}` : ""}`);
};

export const getMarketTrend = (params = {}) => {
  const query = new URLSearchParams();
  if (params.crop) query.append("crop", params.crop);
  if (params.market) query.append("market", params.market);
  if (params.days) query.append("days", params.days);
  const q = query.toString();
  return apiClient.get(`/market/trend${q ? `?${q}` : ""}`);
};

export const getMarketComparison = (params = {}) => {
  const query = new URLSearchParams();
  if (params.crop) query.append("crop", params.crop);
  if (params.state) query.append("state", params.state);
  if (params.district) query.append("district", params.district);
  const q = query.toString();
  return apiClient.get(`/market/compare${q ? `?${q}` : ""}`);
};

export const getMarketSummary = () => apiClient.get("/market/summary");

export const syncMarketPrices = () => apiClient.post("/market/sync");

// Crop Listing / Marketplace API
export const createListing = (payload) =>
  apiClient.post("/market/listings", payload);

export const getListings = (params = {}) => {
  const query = new URLSearchParams();
  if (params.crop) query.append("crop", params.crop);
  if (params.state) query.append("state", params.state);
  if (params.district) query.append("district", params.district);
  if (params.minPrice) query.append("minPrice", params.minPrice);
  if (params.maxPrice) query.append("maxPrice", params.maxPrice);
  if (params.search) query.append("search", params.search);
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);
  const q = query.toString();
  return apiClient.get(`/market/listings${q ? `?${q}` : ""}`);
};

export const getMyListings = (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.crop) query.append("crop", params.crop);
  if (params.search) query.append("search", params.search);
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);
  const q = query.toString();
  return apiClient.get(`/market/listings/mine${q ? `?${q}` : ""}`);
};

export const getListingById = (id) => apiClient.get(`/market/listings/${id}`);

export const updateListing = (id, payload) =>
  apiClient.put(`/market/listings/${id}`, payload);

export const updateListingStatus = (id, status) =>
  apiClient.patch(`/market/listings/${id}/status`, { status });

export const deleteListing = (id) =>
  apiClient.delete(`/market/listings/${id}`);

export const generateListingDescription = (payload) =>
  apiClient.post("/market/listings/generate-description", payload);

// Buyer Enquiry API
export const createEnquiry = (listingId, payload) =>
  apiClient.post(`/market/listings/${listingId}/enquiries`, payload);

export const getMyEnquiries = () => apiClient.get("/market/enquiries/mine");

export const getSellerEnquiries = () => apiClient.get("/market/enquiries/seller");

export const updateEnquiryStatus = (id, status) =>
  apiClient.patch(`/market/enquiries/${id}/status`, { status });
