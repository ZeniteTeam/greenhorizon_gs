import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

/** Header the backend uses to identify the logged-in user (see CurrentUser.java). */
const USER_HEADER = "X-User-Id";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const userId = useAuthStore.getState().id;
  if (userId !== null) {
    config.headers.set(USER_HEADER, String(userId));
  }
  return config;
});

export default api;
