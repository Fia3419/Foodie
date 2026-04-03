import { AuthSession, GoalMode } from "../types/models";

const authStorageKey = "foodie.auth-session";
export const authSessionChangedEventName = "foodie-auth-session-changed";

const isGoalMode = (value: string): value is GoalMode =>
  value === GoalMode.GeneralHealth ||
  value === GoalMode.GainStrength ||
  value === GoalMode.LoseWeight;

export const readStoredAuthSession = (): AuthSession | null => {
  const rawValue = window.localStorage.getItem(authStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<AuthSession>;

    if (
      typeof parsedValue.userId !== "string" ||
      typeof parsedValue.sessionId !== "string" ||
      typeof parsedValue.userName !== "string" ||
      typeof parsedValue.email !== "string" ||
      typeof parsedValue.accessToken !== "string" ||
      typeof parsedValue.refreshToken !== "string" ||
      typeof parsedValue.accessTokenExpiresAtUtc !== "string" ||
      typeof parsedValue.refreshTokenExpiresAtUtc !== "string" ||
      typeof parsedValue.selectedGoalMode !== "string" ||
      !isGoalMode(parsedValue.selectedGoalMode)
    ) {
      return null;
    }

    return parsedValue as AuthSession;
  } catch {
    return null;
  }
};

export const writeStoredAuthSession = (session: AuthSession) => {
  window.localStorage.setItem(authStorageKey, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent(authSessionChangedEventName));
};

export const clearStoredAuthSession = () => {
  window.localStorage.removeItem(authStorageKey);
  window.dispatchEvent(new CustomEvent(authSessionChangedEventName));
};

export const isAccessTokenExpired = (session: AuthSession) =>
  new Date(session.accessTokenExpiresAtUtc).getTime() <= Date.now() + 30_000;

export const isRefreshTokenExpired = (session: AuthSession) =>
  new Date(session.refreshTokenExpiresAtUtc).getTime() <= Date.now();
