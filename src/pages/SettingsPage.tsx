import axios from 'axios'
import { type Dispatch, type FormEvent, type SetStateAction, useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, Row, Stack } from 'react-bootstrap'
import { useChangePasswordMutation } from '../api/foodieApi'
import { LanguageSelect } from '../components/LanguageSelect'
import { useLanguageContext } from '../contexts/LanguageContext'
import { passwordPolicyMinimumLength, validatePasswordConfirmation } from '../lib/passwordPolicy'
import { useSessionContext } from '../contexts/SessionContext'
import { useLogoutAction } from '../lib/useLogoutAction'
import { DEFAULT_MEAL, MEAL_OPTIONS, type MealOption } from '../lib/mealOptions'
import { ChangePasswordRequest } from '../types/models'
import { GoalMode } from '../types/models'

const DEFAULT_MEAL_STORAGE_KEY = 'foodie:default-meal'

const defaultChangePasswordForm: ChangePasswordRequest = {
  currentPassword: '',
  newPassword: '',
}

const readStoredDefaultMeal = (): MealOption => {
  if (typeof window === 'undefined') {
    return DEFAULT_MEAL
  }
  const stored = window.localStorage.getItem(DEFAULT_MEAL_STORAGE_KEY)
  return MEAL_OPTIONS.includes(stored as MealOption) ? (stored as MealOption) : DEFAULT_MEAL
}

type TranslationStrings = ReturnType<typeof useLanguageContext>['t']

const PasswordRules = ({ t }: { t: TranslationStrings }) => (
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

const resolveGoalLabel = (goalMode: GoalMode | undefined, t: TranslationStrings) => {
  switch (goalMode) {
    case GoalMode.GainStrength:
      return t.gainStrength
    case GoalMode.LoseWeight:
      return t.loseWeight
    case GoalMode.GeneralHealth:
      return t.generalHealth
    default:
      return '—'
  }
}

interface ProfileCardProps {
  t: TranslationStrings
  userName: string | undefined
  email: string | undefined
  goalLabel: string
}

const ProfileCard = ({ t, userName, email, goalLabel }: ProfileCardProps) => (
  <Card className='border-0 shadow-sm'>
    <Card.Body className='p-4'>
      <h2 className='h5 text-dark mb-1'>{t.profileTitle}</h2>
      <p className='text-secondary small mb-3'>{t.profileDescription}</p>
      <dl className='row mb-0 small'>
        <dt className='col-sm-4 text-secondary fw-normal'>{t.name}</dt>
        <dd className='col-sm-8 fw-semibold text-dark'>{userName ?? '—'}</dd>
        <dt className='col-sm-4 text-secondary fw-normal'>{t.email}</dt>
        <dd className='col-sm-8 fw-semibold text-dark'>{email ?? '—'}</dd>
        <dt className='col-sm-4 text-secondary fw-normal'>{t.primaryGoal}</dt>
        <dd className='col-sm-8 fw-semibold text-dark'>{goalLabel}</dd>
      </dl>
    </Card.Body>
  </Card>
)

interface ChangePasswordCardProps {
  t: TranslationStrings
  form: ChangePasswordRequest
  setForm: Dispatch<SetStateAction<ChangePasswordRequest>>
  confirmPassword: string
  setConfirmPassword: Dispatch<SetStateAction<string>>
  passwordsMatch: boolean
  errorMessage: string | null
  successMessage: string | null
  isPending: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const ChangePasswordCard = ({
  t,
  form,
  setForm,
  confirmPassword,
  setConfirmPassword,
  passwordsMatch,
  errorMessage,
  successMessage,
  isPending,
  onSubmit,
}: ChangePasswordCardProps) => (
  <Card className='border-0 shadow-sm'>
    <Card.Body className='p-4'>
      <h2 className='h5 text-dark mb-3'>{t.changePassword}</h2>
      <Form onSubmit={onSubmit}>
        <Stack gap={3}>
          <Form.Group controlId='settings-current-password'>
            <Form.Label>{t.currentPassword}</Form.Label>
            <Form.Control
              type='password'
              autoComplete='current-password'
              required
              value={form.currentPassword}
              onChange={(event) => setForm((currentValue) => ({ ...currentValue, currentPassword: event.target.value }))}
            />
          </Form.Group>
          <Form.Group controlId='settings-new-password'>
            <Form.Label>{t.newPassword}</Form.Label>
            <Form.Control
              type='password'
              autoComplete='new-password'
              minLength={passwordPolicyMinimumLength}
              required
              value={form.newPassword}
              onChange={(event) => setForm((currentValue) => ({ ...currentValue, newPassword: event.target.value }))}
            />
          </Form.Group>
          <Form.Group controlId='settings-confirm-password'>
            <Form.Label>{t.confirmPassword}</Form.Label>
            <Form.Control
              type='password'
              autoComplete='new-password'
              minLength={passwordPolicyMinimumLength}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              isInvalid={confirmPassword.length > 0 && !passwordsMatch}
            />
            <Form.Control.Feedback type='invalid'>{t.passwordMismatch}</Form.Control.Feedback>
          </Form.Group>
          <PasswordRules t={t} />
          {errorMessage ? <Alert variant='danger' className='mb-0'>{errorMessage}</Alert> : null}
          {successMessage ? <Alert variant='success' className='mb-0'>{successMessage}</Alert> : null}
          <Button type='submit' variant='outline-success' disabled={isPending || !passwordsMatch}>
            {isPending ? t.changingPassword : t.changePassword}
          </Button>
        </Stack>
      </Form>
    </Card.Body>
  </Card>
)

interface PreferencesCardProps {
  t: TranslationStrings
  defaultMeal: MealOption
  setDefaultMeal: Dispatch<SetStateAction<MealOption>>
}

const PreferencesCard = ({ t, defaultMeal, setDefaultMeal }: PreferencesCardProps) => (
  <Card className='border-0 shadow-sm'>
    <Card.Body className='p-4'>
      <h2 className='h5 text-dark mb-3'>{t.preferencesTitle}</h2>
      <Form.Group controlId='settings-default-meal' className='mb-0'>
        <Form.Label>{t.defaultMealLabel}</Form.Label>
        <Form.Select value={defaultMeal} onChange={(event) => setDefaultMeal(event.target.value as MealOption)} aria-label={t.defaultMealLabel}>
          {MEAL_OPTIONS.map((meal) => (
            <option key={meal} value={meal}>
              {meal}
            </option>
          ))}
        </Form.Select>
        <Form.Text className='text-secondary'>{t.defaultMealDescription}</Form.Text>
      </Form.Group>
    </Card.Body>
  </Card>
)

interface SyncStatusCardProps {
  t: TranslationStrings
  isOnline: boolean
  queuedActions: number
}

const SyncStatusCard = ({ t, isOnline, queuedActions }: SyncStatusCardProps) => (
  <Card className='border-0 shadow-sm'>
    <Card.Body className='p-4'>
      <div className='d-flex justify-content-between align-items-start gap-3'>
        <div>
          <h2 className='h5 text-dark mb-2'>{t.syncStatusTitle}</h2>
          <p className='text-secondary small mb-0'>
            {queuedActions > 0 ? t.syncStatusPending(queuedActions) : t.syncStatusSynced}
          </p>
        </div>
        <Badge bg={isOnline ? 'success' : 'secondary'} pill>
          {isOnline ? t.syncStatusOnline : t.syncStatusOffline}
        </Badge>
      </div>
    </Card.Body>
  </Card>
)

export const SettingsPage = () => {
  const { t } = useLanguageContext()
  const { authSession, isOnline, queuedActions } = useSessionContext()
  const { logout, isPending } = useLogoutAction()
  const [defaultMeal, setDefaultMeal] = useState<MealOption>(() => readStoredDefaultMeal())
  const [changePasswordForm, setChangePasswordForm] = useState<ChangePasswordRequest>(defaultChangePasswordForm)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changePasswordMessage, setChangePasswordMessage] = useState<string | null>(null)
  const changePasswordMutation = useChangePasswordMutation()

  useEffect(() => {
    window.localStorage.setItem(DEFAULT_MEAL_STORAGE_KEY, defaultMeal)
  }, [defaultMeal])

  const goalLabel = resolveGoalLabel(authSession?.selectedGoalMode, t)

  const changePasswordsMatch = validatePasswordConfirmation(changePasswordForm.newPassword, confirmPassword)
  const changePasswordError = changePasswordMutation.error && axios.isAxiosError<{ message?: string }>(changePasswordMutation.error)
    ? changePasswordMutation.error.response?.data?.message ?? t.authError
    : null

  const handleChangePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!changePasswordsMatch) {
      return
    }

    setChangePasswordMessage(null)
    changePasswordMutation.mutate(changePasswordForm, {
      onSuccess: (response) => {
        setChangePasswordMessage(response.message ?? t.passwordChangeSuccess)
        setChangePasswordForm(defaultChangePasswordForm)
        setConfirmPassword('')
      },
    })
  }

  return (
    <Stack gap={4}>
      <Card className='border-0 shadow-sm foodie-surface'>
        <Card.Body className='p-4'>
          <p className='small text-uppercase text-muted fw-semibold mb-2'>{t.settings}</p>
          <h1 className='h2 text-dark mb-2'>{t.accountSettings}</h1>
          <p className='text-secondary mb-0'>{t.languageDescription}</p>
        </Card.Body>
      </Card>

      <Row className='g-4'>
        <Col lg={5}>
          <Card className='border-0 shadow-sm h-100'>
            <Card.Body className='p-4'>
              <h2 className='h5 text-dark mb-3'>{t.language}</h2>
              <LanguageSelect className='form-select mb-4' />
              <h2 className='h5 text-dark mb-3'>{t.securityActions}</h2>
              <div className='d-grid gap-2'>
                <Button variant='outline-dark' onClick={logout} disabled={isPending}>
                  {t.logout}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Stack gap={4}>
            <ProfileCard t={t} userName={authSession?.userName} email={authSession?.email} goalLabel={goalLabel} />
            <ChangePasswordCard
              t={t}
              form={changePasswordForm}
              setForm={setChangePasswordForm}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              passwordsMatch={changePasswordsMatch}
              errorMessage={changePasswordError}
              successMessage={changePasswordMessage}
              isPending={changePasswordMutation.isPending}
              onSubmit={handleChangePasswordSubmit}
            />
            <PreferencesCard t={t} defaultMeal={defaultMeal} setDefaultMeal={setDefaultMeal} />
            <SyncStatusCard t={t} isOnline={isOnline} queuedActions={queuedActions} />
          </Stack>
        </Col>
      </Row>
    </Stack>
  )
}