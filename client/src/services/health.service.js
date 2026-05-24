import api from "../lib/axios";

export const healthService = {
  check: () => api.get("/health"),
};