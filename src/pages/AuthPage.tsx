import { useState } from 'react'
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Stack, Tab, Tabs } from 'react-bootstrap'
import { useLoginMutation, useRegisterMutation } from '../api/foodieApi'
import { LanguageSelect } from '../components/LanguageSelect'
import { useLanguageContext } from '../contexts/LanguageContext'
import { useSessionContext } from '../contexts/SessionContext'
import { GoalMode, LoginRequest, RegisterRequest } from '../types/models'

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

export const AuthPage = () => {
  const { setAuthSession } = useSessionContext()
  const { t } = useLanguageContext()
  const [activeTab, setActiveTab] = useState('login')
  const [loginForm, setLoginForm] = useState<LoginRequest>(defaultLogin)
  const [registerForm, setRegisterForm] = useState<RegisterRequest>(defaultRegister)
  const loginMutation = useLoginMutation()
  const registerMutation = useRegisterMutation()

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
    registerMutation.mutate(registerForm, {
      onSuccess: (session) => {
        setAuthSession(session)
      },
    })
  }

  const authError = loginMutation.error ?? registerMutation.error

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xl={10}>
          <Card className="border-0 shadow-lg overflow-hidden foodie-surface">
            <Card.Body className="p-0">
              <Row className="g-0">
                <Col lg={5} className="foodie-auth-panel p-4 p-lg-5">
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3 flex-wrap">
                    <Badge bg="success">{t.authHeroBadge}</Badge>
                    <LanguageSelect className="form-select form-select-sm foodie-language-select" />
                  </div>
                  <h1 className="display-6 text-dark fw-semibold mb-3">{t.authHeroTitle}</h1>
                  <p className="text-secondary mb-4">
                    {t.authHeroDescription}
                  </p>
                  <ul className="text-secondary ps-3 mb-0">
                    <li>{t.authBenefitOne}</li>
                    <li>{t.authBenefitTwo}</li>
                    <li>{t.authBenefitThree}</li>
                  </ul>
                </Col>
                <Col lg={7} className="p-4 p-lg-5 bg-white">
                  <Tabs activeKey={activeTab} onSelect={(key) => setActiveTab(key ?? 'login')} className="mb-4">
                    <Tab eventKey="login" title={t.login}>
                      <Form className="pt-3" onSubmit={handleLoginSubmit}>
                        <Stack gap={3}>
                          <Form.Group controlId="login-email">
                            <Form.Label>{t.email}</Form.Label>
                            <Form.Control
                              type="email"
                              value={loginForm.email}
                              onChange={(event) => setLoginForm((currentValue) => ({ ...currentValue, email: event.target.value }))}
                              required
                            />
                          </Form.Group>
                          <Form.Group controlId="login-password">
                            <Form.Label>{t.password}</Form.Label>
                            <Form.Control
                              type="password"
                              value={loginForm.password}
                              onChange={(event) => setLoginForm((currentValue) => ({ ...currentValue, password: event.target.value }))}
                              required
                            />
                          </Form.Group>
                          {authError ? <Alert variant="danger">{t.authError}</Alert> : null}
                          <Button type="submit" variant="success" disabled={loginMutation.isPending}>
                            {loginMutation.isPending ? t.signingIn : t.signIn}
                          </Button>
                        </Stack>
                      </Form>
                    </Tab>
                    <Tab eventKey="register" title={t.register}>
                      <Form className="pt-3" onSubmit={handleRegisterSubmit}>
                        <Stack gap={3}>
                          <Form.Group controlId="register-name">
                            <Form.Label>{t.name}</Form.Label>
                            <Form.Control
                              value={registerForm.userName}
                              onChange={(event) => setRegisterForm((currentValue) => ({ ...currentValue, userName: event.target.value }))}
                              required
                            />
                          </Form.Group>
                          <Form.Group controlId="register-email">
                            <Form.Label>{t.email}</Form.Label>
                            <Form.Control
                              type="email"
                              value={registerForm.email}
                              onChange={(event) => setRegisterForm((currentValue) => ({ ...currentValue, email: event.target.value }))}
                              required
                            />
                          </Form.Group>
                          <Form.Group controlId="register-password">
                            <Form.Label>{t.password}</Form.Label>
                            <Form.Control
                              type="password"
                              minLength={8}
                              value={registerForm.password}
                              onChange={(event) => setRegisterForm((currentValue) => ({ ...currentValue, password: event.target.value }))}
                              required
                            />
                          </Form.Group>
                          <Form.Group controlId="register-goal">
                            <Form.Label>{t.primaryGoal}</Form.Label>
                            <select
                              className="form-select"
                              aria-label={t.primaryGoal}
                              title={t.primaryGoal}
                              name="goalMode"
                              value={registerForm.goalMode}
                              onChange={(event) => setRegisterForm((currentValue) => ({ ...currentValue, goalMode: event.target.value as GoalMode }))}
                            >
                              <option value={GoalMode.GeneralHealth}>{t.generalHealth}</option>
                              <option value={GoalMode.GainStrength}>{t.gainStrength}</option>
                              <option value={GoalMode.LoseWeight}>{t.loseWeight}</option>
                            </select>
                          </Form.Group>
                          {authError ? <Alert variant="danger">{t.registerError}</Alert> : null}
                          <Button type="submit" variant="success" disabled={registerMutation.isPending}>
                            {registerMutation.isPending ? t.creatingAccount : t.createAccount}
                          </Button>
                        </Stack>
                      </Form>
                    </Tab>
                  </Tabs>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}