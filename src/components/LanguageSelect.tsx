import { SelectHTMLAttributes } from 'react'
import { useLanguageContext } from '../contexts/LanguageContext'
import { AppLanguage } from '../types/models'

type LanguageSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'>

export const LanguageSelect = ({ className, ...props }: LanguageSelectProps) => {
  const { language, setLanguage, t } = useLanguageContext()

  return (
    <select
      {...props}
      className={className}
      aria-label={props['aria-label'] ?? t.language}
      value={language}
      onChange={(event) => setLanguage(event.target.value as AppLanguage)}
    >
      <option value="en">English</option>
      <option value="sv">Svenska</option>
    </select>
  )
}