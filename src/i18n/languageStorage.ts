import { AppLanguage } from "../types/models";

export const languageStorageKey = "foodie.language";

export const readStoredLanguage = (): AppLanguage => {
  const storedValue = window.localStorage.getItem(languageStorageKey);
  return storedValue === "sv" ? "sv" : "en";
};

export const writeStoredLanguage = (language: AppLanguage) => {
  window.localStorage.setItem(languageStorageKey, language);
};
