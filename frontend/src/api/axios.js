import { clearAuthStorage, getToken } from "../utils/storage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const buildUrl = (url) => {
  if (url.startsWith("http")) {
    return url;
  }

  return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

const request = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(url), {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    clearAuthStorage();
    window.dispatchEvent(new Event("farmio:auth-expired"));
    if (window.location.pathname !== "/login") {
      window.history.pushState({}, "", "/login");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

const apiClient = {
  get: (url) => request(url),
  post: (url, body) =>
    request(url, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: (url, body) =>
    request(url, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  patch: (url, body) =>
    request(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: (url) =>
    request(url, {
      method: "DELETE",
    }),
};

export default apiClient;
