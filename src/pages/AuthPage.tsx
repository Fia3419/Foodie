import axios from 'axios'
import { type Dispatch, type FormEvent, type SetStateAction, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Stack, Tab, Tabs } from 'react-bootstrap'
import { useForgotPasswordMutation, useLoginMutation, useRegisterMutation, useResetPasswordMutation } from '../api/foodieApi'
import { AuthIllustration, FoodieIcon, type FoodieIconName } from '../components/ColorfulVisuals'
import { LanguageSelect } from '../components/LanguageSelect'
import { useLanguageContext } from '../contexts/LanguageContext'
import { passwordPolicyMinimumLength, validatePasswordConfirmation } from '../lib/passwordPolicy'
import { useSessionContext } from '../contexts/SessionContext'
import { ForgotPasswordRequest, GoalMode, LoginRequest, RegisterRequest, ResetPasswordRequest } from '../types/models'

const defaultLogin: LoginRequest = {
  email: '',
  password: '',
}

const defaultRegister: RegisterRequest = {
  userName: '',
  email: '',
  password: '',
  goalMode: GoalMode.GainStrength,
}

const defaultForgotPassword: ForgotPasswordRequest = {
  email: '',
}

const defaultResetPassword: ResetPasswordRequest = {
  email: '',
  resetCode: '',
  newPassword: '',
}

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallbackMessage
  }

  return fallbackMessage
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

interface LoginTabProps {
  t: TranslationStrings
  form: LoginRequest
  setForm: Dispatch<SetStateAction<LoginRequest>>
  errorMessage: string | null
  isPending: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const LoginTabContent = ({ t, form, setForm, errorMessage, isPending, onSubmit }: LoginTabProps) => (
  <Form className='pt-3' onSubmit={onSubmit}>
    <Stack gap={3}>
      <Form.Group controlId='login-email'>
        <Form.Label>{t.email}</Form.Label>
        <Form.Control
          type='email'
          autoComplete='email'
          required
          value={form.email}
          onChange={(event) => setForm((currentValue) => ({ ...currentValue, email: event.target.value }))}
        />
      </Form.Group>
      <Form.Group controlId='login-password'>
        <Form.Label>{t.password}</Form.Label>
        <Form.Control
          type='password'
          autoComplete='current-password'
          required
          value={form.password}
          onChange={(event) => setForm((currentValue) => ({ ...currentValue, password: event.target.value }))}
        />
      </Form.Group>
      {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : null}
      <Button type='submit' variant='success' disabled={isPending}>
        {isPending ? t.signingIn : t.signIn}
      </Button>
    </Stack>
  </Form>
)

interface RegisterTabProps {
  t: TranslationStrings
  form: RegisterRequest
  setForm: Dispatch<SetStateAction<RegisterRequest>>
  confirmPassword: string
  setConfirmPassword: Dispatch<SetStateAction<string>>
  passwordsMatch: boolean
  errorMessage: string | null
  isPending: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const RegisterTabContent = ({
  t,
  form,
  setForm,
  confirmPassword,
  setConfirmPassword,
  passwordsMatch,
  errorMessage,
  isPending,
  onSubmit,
}: RegisterTabProps) => (
  <Form className='pt-3' onSubmit={onSubmit}>
    <Stack gap={3}>
      <Form.Group controlId='register-name'>
        <Form.Label>{t.name}</Form.Label>
        <Form.Control
          autoComplete='name'
          required
          value={form.userName}
          onChange={(event) => setForm((currentValue) => ({ ...currentValue, userName: event.target.value }))}
        />
      </Form.Group>
      <Form.Group controlId='register-email'>
        <Form.Label>{t.email}</Form.Label>
        <Form.Control
          type='email'
          autoComplete='email'
          required
          value={form.email}
          onChange={(event) => setForm((currentValue) => ({ ...currentValue, email: event.target.value }))}
        />
      </Form.Group>
      <Form.Group controlId='register-password'>
        <Form.Label>{t.password}</Form.Label>
        <Form.Control
          type='password'
          autoComplete='new-password'
          minLength={passwordPolicyMinimumLength}
          required
          value={form.password}
          onChange={(event) => setForm((currentValue) => ({ ...currentValue, password: event.target.value }))}
        />
      </Form.Group>
      <Form.Group controlId='register-confirm-password'>
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
      <Form.Group controlId='register-goal'>
        <Form.Label>{t.primaryGoal}</Form.Label>
        <Form.Select
          name='goalMode'
          value={form.goalMode}
          onChange={(event) => setForm((currentValue) => ({ ...currentValue, goalMode: event.target.value as GoalMode }))}
        >
          <option value={GoalMode.GeneralHealth}>{t.generalHealth}</option>
          <option value={GoalMode.GainStrength}>{t.gainStrength}</option>
          <option value={GoalMode.LoseWeight}>{t.loseWeight}</option>
        </Form.Select>
      </Form.Group>
      {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : null}
      <Button type='submit' variant='success' disabled={isPending || !passwordsMatch}>
        {isPending ? t.creatingAccount : t.createAccount}
      </Button>
    </Stack>
  </Form>
)

interface ForgotPasswordTabProps {
  t: TranslationStrings
  forgotPasswordForm: ForgotPasswordRequest
  setForgotPasswordForm: Dispatch<SetStateAction<ForgotPasswordRequest>>
  forgotPasswordError: string | null
  forgotPasswordMessage: string | null
  forgotPasswordPreviewCode: string | null
  forgotPasswordPending: boolean
  onForgotPasswordSubmit: (event: FormEvent<HTMLFormElement>) => void
  resetPasswordForm: ResetPasswordRequest
  setResetPasswordForm: Dispatch<SetStateAction<ResetPasswordRequest>>
  resetConfirmPassword: string
  setResetConfirmPassword: Dispatch<SetStateAction<string>>
  resetPasswordsMatch: boolean
  resetPasswordError: string | null
  resetPasswordMessage: string | null
  resetPasswordPending: boolean
  onResetPasswordSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const ForgotPasswordTabContent = ({
  t,
  forgotPasswordForm,
  setForgotPasswordForm,
  forgotPasswordError,
  forgotPasswordMessage,
  forgotPasswordPreviewCode,
  forgotPasswordPending,
  onForgotPasswordSubmit,
  resetPasswordForm,
  setResetPasswordForm,
  resetConfirmPassword,
  setResetConfirmPassword,
  resetPasswordsMatch,
  resetPasswordError,
  resetPasswordMessage,
  resetPasswordPending,
  onResetPasswordSubmit,
}: ForgotPasswordTabProps) => (
  <Stack gap={4} className='pt-3'>
    <div>
      <h2 className='h5 text-dark mb-2'>{t.requestPasswordReset}</h2>
      <p className='text-secondary small mb-3'>{t.forgotPasswordDescription}</p>
      <Form onSubmit={onForgotPasswordSubmit}>
        <Stack gap={3}>
          <Form.Group controlId='forgot-password-email'>
            <Form.Label>{t.email}</Form.Label>
            <Form.Control
              type='email'
              autoComplete='email'
              required
              value={forgotPasswordForm.email}
              onChange={(event) => setForgotPasswordForm({ email: event.target.value })}
            />
          </Form.Group>
          {forgotPasswordError ? <Alert variant='danger'>{forgotPasswordError}</Alert> : null}
          {forgotPasswordMessage ? <Alert variant='success' className='mb-0'>{forgotPasswordMessage}</Alert> : null}
          {forgotPasswordPreviewCode ? (
            <Alert variant='warning' className='mb-0'>
              <strong>{t.developmentResetCode}:</strong> {forgotPasswordPreviewCode}
            </Alert>
          ) : null}
          <Button type='submit' variant='outline-success' disabled={forgotPasswordPending}>
            {forgotPasswordPending ? t.requestingPasswordReset : t.requestPasswordReset}
          </Button>
        </Stack>
      </Form>
    </div>

    <div>
      <h2 className='h5 text-dark mb-2'>{t.resetPassword}</h2>
      <p className='text-secondary small mb-3'>{t.resetPasswordDescription}</p>
      <Form onSubmit={onResetPasswordSubmit}>
        <Stack gap={3}>
          <Form.Group controlId='reset-password-email'>
            <Form.Label>{t.email}</Form.Label>
            <Form.Control
              type='email'
              autoComplete='email'
              required
              value={resetPasswordForm.email}
              onChange={(event) => setResetPasswordForm((currentValue) => ({ ...currentValue, email: event.target.value }))}
            />
          </Form.Group>
          <Form.Group controlId='reset-password-code'>
            <Form.Label>{t.resetCode}</Form.Label>
            <Form.Control
              required
              value={resetPasswordForm.resetCode}
              onChange={(event) => setResetPasswordForm((currentValue) => ({ ...currentValue, resetCode: event.target.value.toUpperCase() }))}
            />
            <Form.Text className='text-secondary'>{t.resetCodeDescription}</Form.Text>
          </Form.Group>
          <Form.Group controlId='reset-password-new'>
            <Form.Label>{t.newPassword}</Form.Label>
            <Form.Control
              type='password'
              autoComplete='new-password'
              minLength={passwordPolicyMinimumLength}
              required
              value={resetPasswordForm.newPassword}
              onChange={(event) => setResetPasswordForm((currentValue) => ({ ...currentValue, newPassword: event.target.value }))}
            />
          </Form.Group>
          <Form.Group controlId='reset-password-confirm'>
            <Form.Label>{t.confirmPassword}</Form.Label>
            <Form.Control
              type='password'
              autoComplete='new-password'
              minLength={passwordPolicyMinimumLength}
              required
              value={resetConfirmPassword}
              onChange={(event) => setResetConfirmPassword(event.target.value)}
              isInvalid={resetConfirmPassword.length > 0 && !resetPasswordsMatch}
            />
            <Form.Control.Feedback type='invalid'>{t.passwordMismatch}</Form.Control.Feedback>
          </Form.Group>
          <PasswordRules t={t} />
          {resetPasswordError ? <Alert variant='danger'>{resetPasswordError}</Alert> : null}
          {resetPasswordMessage ? <Alert variant='success'>{resetPasswordMessage}</Alert> : null}
          <Button type='submit' variant='success' disabled={resetPasswordPending || !resetPasswordsMatch}>
            {resetPasswordPending ? t.saving : t.resetPassword}
          </Button>
        </Stack>
      </Form>
    </div>
  </Stack>
)

export const AuthPage = () => {
  const { setAuthSession } = useSessionContext()
  const { t } = useLanguageContext()
  const [activeTab, setActiveTab] = useState('login')
  const [loginForm, setLoginForm] = useState<LoginRequest>(defaultLogin)
  const [registerForm, setRegisterForm] = useState<RegisterRequest>(defaultRegister)
  const [forgotPasswordForm, setForgotPasswordForm] = useState<ForgotPasswordRequest>(defaultForgotPassword)
  const [resetPasswordForm, setResetPasswordForm] = useState<ResetPasswordRequest>(defaultResetPassword)
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null)
  const [forgotPasswordPreviewCode, setForgotPasswordPreviewCode] = useState<string | null>(null)
  const [resetPasswordMessage, setResetPasswordMessage] = useState<string | null>(null)
  const loginMutation = useLoginMutation()
  const registerMutation = useRegisterMutation()
  const forgotPasswordMutation = useForgotPasswordMutation()
  const resetPasswordMutation = useResetPasswordMutation()

  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    loginMutation.mutate(loginForm, {
      onSuccess: (session) => {
        setAuthSession(session)
      },
    })
  }

  const handleRegisterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validatePasswordConfirmation(registerForm.password, registerConfirmPassword)) {
      return
    }

    registerMutation.mutate(registerForm, {
      onSuccess: (session) => {
        setAuthSession(session)
      },
    })
  }

  const handleForgotPasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setForgotPasswordMessage(null)
    setForgotPasswordPreviewCode(null)

    forgotPasswordMutation.mutate(forgotPasswordForm, {
      onSuccess: (response) => {
        setForgotPasswordMessage(response.message ?? t.passwordResetRequestSuccess)
        setForgotPasswordPreviewCode(response.previewResetCode)
        setResetPasswordForm((currentValue) => ({
          ...currentValue,
          email: forgotPasswordForm.email,
          resetCode: response.previewResetCode ?? currentValue.resetCode,
        }))
      },
    })
  }

  const handleResetPasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validatePasswordConfirmation(resetPasswordForm.newPassword, resetConfirmPassword)) {
      return
    }

    setResetPasswordMessage(null)

    resetPasswordMutation.mutate(resetPasswordForm, {
      onSuccess: (response) => {
        setResetPasswordMessage(response.message ?? t.passwordResetSuccess)
        setLoginForm((currentValue) => ({ ...currentValue, email: resetPasswordForm.email, password: '' }))
        setResetPasswordForm(defaultResetPassword)
        setResetConfirmPassword('')
        setActiveTab('login')
      },
    })
  }

  const loginError = loginMutation.error ? getApiErrorMessage(loginMutation.error, t.authError) : null
  const registerError = registerMutation.error ? getApiErrorMessage(registerMutation.error, t.registerError) : null
  const forgotPasswordError = forgotPasswordMutation.error ? getApiErrorMessage(forgotPasswordMutation.error, t.passwordResetRequestSuccess) : null
  const resetPasswordError = resetPasswordMutation.error ? getApiErrorMessage(resetPasswordMutation.error, t.authError) : null
  const registerPasswordsMatch = validatePasswordConfirmation(registerForm.password, registerConfirmPassword)
  const resetPasswordsMatch = validatePasswordConfirmation(resetPasswordForm.newPassword, resetConfirmPassword)
  const authBenefits = [
    { icon: 'shield', text: t.authBenefitOne },
    { icon: 'spark', text: t.authBenefitTwo },
    { icon: 'mail', text: t.authBenefitThree },
  ] satisfies Array<{ icon: FoodieIconName; text: string }>

  return (
    <main>
      <Container className='py-5'>
        <Row className='justify-content-center'>
          <Col xl={10}>
            <Card className='border-0 shadow-lg overflow-hidden foodie-surface'>
              <Card.Body className='p-0'>
                <Row className='g-0'>
                  <Col lg={5} className='foodie-auth-panel p-4 p-lg-5'>
                    <div className='d-flex justify-content-between align-items-start gap-3 mb-3 flex-wrap'>
                      <Badge bg='success'>{t.authHeroBadge}</Badge>
                      <LanguageSelect className='form-select form-select-sm foodie-language-select' />
                    </div>
                    <div className='foodie-auth-visual mb-4'>
                      <AuthIllustration />
                    </div>
                    <h1 className='display-6 text-dark fw-semibold mb-3'>{t.authHeroTitle}</h1>
                    <p className='text-secondary mb-4'>{t.authHeroDescription}</p>
                    <ul className='list-unstyled foodie-benefit-list mb-0'>
                      {authBenefits.map((benefit) => (
                        <li key={benefit.text} className='foodie-benefit-item'>
                          <span className='foodie-benefit-icon'>
                            <FoodieIcon name={benefit.icon} className='foodie-inline-icon' />
                          </span>
                          <span>{benefit.text}</span>
                        </li>
                      ))}
                    </ul>
                  </Col>
                  <Col lg={7} className='p-4 p-lg-5 bg-white'>
                    <Tabs activeKey={activeTab} onSelect={(key) => setActiveTab(key ?? 'login')} className='mb-4'>
                      <Tab eventKey='login' title={t.login}>
                        <LoginTabContent
                          t={t}
                          form={loginForm}
                          setForm={setLoginForm}
                          errorMessage={loginError}
                          isPending={loginMutation.isPending}
                          onSubmit={handleLoginSubmit}
                        />
                      </Tab>
                      <Tab eventKey='register' title={t.register}>
                        <RegisterTabContent
                          t={t}
                          form={registerForm}
                          setForm={setRegisterForm}
                          confirmPassword={registerConfirmPassword}
                          setConfirmPassword={setRegisterConfirmPassword}
                          passwordsMatch={registerPasswordsMatch}
                          errorMessage={registerError}
                          isPending={registerMutation.isPending}
                          onSubmit={handleRegisterSubmit}
                        />
                      </Tab>
                      <Tab eventKey='forgot-password' title={t.forgotPassword}>
                        <ForgotPasswordTabContent
                          t={t}
                          forgotPasswordForm={forgotPasswordForm}
                          setForgotPasswordForm={setForgotPasswordForm}
                          forgotPasswordError={forgotPasswordError}
                          forgotPasswordMessage={forgotPasswordMessage}
                          forgotPasswordPreviewCode={forgotPasswordPreviewCode}
                          forgotPasswordPending={forgotPasswordMutation.isPending}
                          onForgotPasswordSubmit={handleForgotPasswordSubmit}
                          resetPasswordForm={resetPasswordForm}
                          setResetPasswordForm={setResetPasswordForm}
                          resetConfirmPassword={resetConfirmPassword}
                          setResetConfirmPassword={setResetConfirmPassword}
                          resetPasswordsMatch={resetPasswordsMatch}
                          resetPasswordError={resetPasswordError}
                          resetPasswordMessage={resetPasswordMessage}
                          resetPasswordPending={resetPasswordMutation.isPending}
                          onResetPasswordSubmit={handleResetPasswordSubmit}
                        />
                      </Tab>
                    </Tabs>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  )
}