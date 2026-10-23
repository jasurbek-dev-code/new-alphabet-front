import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

export const getTelegramInitData = (): string => {
  return window.Telegram?.WebApp?.initData || "";
};

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const initData = getTelegramInitData();
  if (initData) {
    config.headers["X-Telegram-Init-Data"] = initData;
  }
  return config;
});
export default api;
