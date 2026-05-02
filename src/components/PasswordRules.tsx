import type { Translation } from '../i18n/translations'

interface PasswordRulesProps {
  t: Pick<Translation, 'passwordRulesTitle' | 'passwordRuleLength' | 'passwordRuleUppercase' | 'passwordRuleLowercase' | 'passwordRuleDigit' | 'passwordRuleSpecial'>
}

export const PasswordRules = ({ t }: PasswordRulesProps) => (
  <div>
    <div className='fw-semibold small text-dark mb-1'>{t.passwordRulesTitle}</div>
    <ul className='small text-secondary ps-3 mb-0'>
      <li>{t.passwordRuleLength}</li>
      <li>{t.passwordRuleUppercase}</li>
      <li>{t.passwordRuleLowercase}</li>
      <li>{t.passwordRuleDigit}</li>
      <li>{t.passwordRuleSpecial}</li>
    </ul>
  </div>
)