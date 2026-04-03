import {
  clearStoredAuthSession,
  authSessionChangedEventName,
  isAccessTokenExpired,
  isRefreshTokenExpired,
  readStoredAuthSession,
  writeStoredAuthSession,
} from "./authStorage";
import { AuthSession } from "../types/models";
import { readStoredLanguage } from "../i18n/languageStorage";

let activeRefreshRequest: Promise<AuthSession | null> | null = null;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const refreshAuthSessionIfNeeded = async (
  force = false,
): Promise<AuthSession | null> => {
  const currentSession = readStoredAuthSession();

  if (!currentSession) {
    return null;
  }

  if (!force && !isAccessTokenExpired(currentSession)) {
    return currentSession;
  }

  if (isRefreshTokenExpired(currentSession)) {
    clearStoredAuthSession();
    return null;
  }

  if (!activeRefreshRequest) {
    activeRefreshRequest = fetch(`${apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": readStoredLanguage(),
      },
      body: JSON.stringify({ refreshToken: currentSession.refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            clearStoredAuthSession();
          }

          return null;
        }

        return (await response.json()) as AuthSession;
      })
      .then((nextSession) => {
        if (!nextSession) {
          return null;
        }

        writeStoredAuthSession(nextSession);
        return nextSession;
      })
      .catch(() => {
        return null;
      })
      .finally(() => {
        activeRefreshRequest = null;
      });
  }

  return activeRefreshRequest;
};

export const getDeviceNameHeader = () => {
  const platform =
    navigator.userAgentData?.platform ??
    navigator.platform ??
    "Unknown platform";
  return `Foodie on ${platform}`;
};

window.addEventListener(authSessionChangedEventName, () => {
  activeRefreshRequest = null;
});
