import axios from "axios";
import env from "../config/env.js";

const axiosInstance = axios.create({
  baseURL: env.API_URL,
  withCredentials: true, // Send cookies (for refresh tokens)
  timeout: 10000,
});

// Request interceptor (we'll add JWT in Phase 2)
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // We'll handle token refresh here in Phase 2
    return Promise.reject(error);
  }
);

export default axiosInstance;