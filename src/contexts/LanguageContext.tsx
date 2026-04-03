import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react'
import { AppLanguage } from '../types/models'
import { translations } from '../i18n/translations'
import { readStoredLanguage, writeStoredLanguage } from '../i18n/languageStorage'

interface LanguageContextValue {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  t: typeof translations.en
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => readStoredLanguage())

  const setLanguage = (nextLanguage: AppLanguage) => {
    writeStoredLanguage(nextLanguage)
    setLanguageState(nextLanguage)
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language],
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguageContext = () => {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguageContext must be used within LanguageProvider')
  }

  return context
}