import axios from "axios";

const API_URL = "https://new-alphabet-back-3.onrender.com";

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
