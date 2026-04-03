import axios from "axios";
import { refreshAuthSessionIfNeeded } from "../auth/refreshSession";
import { readStoredLanguage } from "../i18n/languageStorage";
import { getTimeZoneOffsetHeaderValue } from "../lib/dateTime";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 5000,
});

httpClient.interceptors.request.use(async (config) => {
  const session = await refreshAuthSessionIfNeeded();
  config.headers["Accept-Language"] = readStoredLanguage();
  config.headers["X-Timezone-Offset-Minutes"] = getTimeZoneOffsetHeaderValue();

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status !== 401 || error.config?._retry) {
      throw error;
    }

    const nextSession = await refreshAuthSessionIfNeeded(true);

    if (!nextSession) {
      throw error;
    }

    error.config._retry = true;
    error.config.headers.Authorization = `Bearer ${nextSession.accessToken}`;
    return httpClient.request(error.config);
  },
);
