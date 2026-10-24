import axios from "axios";

export const getTelegramInitData = (): string => {
  // 1. Agar haqiqiy Telegram WebApp muhitida bo'lsa (window.Telegram.WebApp)
  const tgInitData = window.Telegram?.WebApp?.initData;
  if (tgInitData && tgInitData.trim() !== "") {
    return tgInitData;
  }

  // 1.2. Telegram WebApp Desktop/Web ba'zida hash orqali yuboradi (#tgWebAppData=...)
  try {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      const hashInitData = params.get("tgWebAppData");
      if (hashInitData) {
        return hashInitData;
      }
    }
  } catch (e) {
    console.error("Error reading tgWebAppData from hash:", e);
  }

  // 2. Telegramdan tashqarida test qilish uchun faqat mavjud bo'lsa localStorage'dan olish
  const localInitData = localStorage.getItem("telegram_init_data_mock");
  if (localInitData && localInitData.trim() !== "") {
    return localInitData;
  }

  return "";
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
