import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true, // Send cookies (refresh tokens)
  timeout: 10000,
});

// Request interceptor (we'll add JWT in Phase 2)
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor (centralized error handling)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject({ ...error, message });
  }
);

export default api;