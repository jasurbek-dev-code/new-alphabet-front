import axios from "axios";

// Default mock initData for browser testing outside of Telegram
export const DEFAULT_BROWSER_INIT_DATA =
  "query_id=test_browser_query_100001&user=%7B%22id%22%3A100001%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22Foydalanuvchi%22%2C%22username%22%3A%22browser_test_user%22%2C%22language_code%22%3A%22uz%22%7D&mock=true";

export const getTelegramInitData = (): string => {
  // 1. Agar haqiqiy Telegram WebApp muhitida bo'lsa
  const tgInitData = window.Telegram?.WebApp?.initData;
  if (tgInitData) {
    return tgInitData;
  }

  // 2. Telegramdan tashqarida (brauzerda) test qilish uchun localStorage'dan olish
  const localInitData = localStorage.getItem("telegram_init_data_mock");
  if (localInitData) {
    return localInitData;
  }

  // 3. Brauzerda test uchun default mock initData
  return DEFAULT_BROWSER_INIT_DATA;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://new-alphabet-back-3.onrender.com/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const initData = getTelegramInitData();
  if (initData) {
    config.headers["X-Telegram-Init-Data"] = initData;
    config.headers["Authorization"] = `Bearer ${initData}`;
  }
  return config;
});

export default api;
