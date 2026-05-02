import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Form, Row, Stack } from 'react-bootstrap'
import { LanguageSelect } from '../components/LanguageSelect'
import { useLanguageContext } from '../contexts/LanguageContext'
import { useSessionContext } from '../contexts/SessionContext'
import { useLogoutAction } from '../lib/useLogoutAction'
import { DEFAULT_MEAL, MEAL_OPTIONS, type MealOption } from '../lib/mealOptions'
import { GoalMode } from '../types/models'

const DEFAULT_MEAL_STORAGE_KEY = 'foodie:default-meal'

const readStoredDefaultMeal = (): MealOption => {
  if (typeof window === 'undefined') {
    return DEFAULT_MEAL
  }
  const stored = window.localStorage.getItem(DEFAULT_MEAL_STORAGE_KEY)
  return MEAL_OPTIONS.includes(stored as MealOption) ? (stored as MealOption) : DEFAULT_MEAL
}

export const SettingsPage = () => {
  const { t } = useLanguageContext()
  const { authSession, isOnline, queuedActions } = useSessionContext()
  const { logout, isPending } = useLogoutAction()
  const [defaultMeal, setDefaultMeal] = useState<MealOption>(() => readStoredDefaultMeal())

  useEffect(() => {
    window.localStorage.setItem(DEFAULT_MEAL_STORAGE_KEY, defaultMeal)
  }, [defaultMeal])

  const goalLabel = (() => {
    switch (authSession?.selectedGoalMode) {
      case GoalMode.GainStrength:
        return t.gainStrength
      case GoalMode.LoseWeight:
        return t.loseWeight
      case GoalMode.GeneralHealth:
        return t.generalHealth
      default:
        return '—'
    }
  })()

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
            <Card className='border-0 shadow-sm'>
              <Card.Body className='p-4'>
                <h2 className='h5 text-dark mb-1'>{t.profileTitle}</h2>
                <p className='text-secondary small mb-3'>{t.profileDescription}</p>
                <dl className='row mb-0 small'>
                  <dt className='col-sm-4 text-secondary fw-normal'>{t.name}</dt>
                  <dd className='col-sm-8 fw-semibold text-dark'>{authSession?.userName ?? '—'}</dd>
                  <dt className='col-sm-4 text-secondary fw-normal'>{t.email}</dt>
                  <dd className='col-sm-8 fw-semibold text-dark'>{authSession?.email ?? '—'}</dd>
                  <dt className='col-sm-4 text-secondary fw-normal'>{t.primaryGoal}</dt>
                  <dd className='col-sm-8 fw-semibold text-dark'>{goalLabel}</dd>
                </dl>
              </Card.Body>
            </Card>

            <Card className='border-0 shadow-sm'>
              <Card.Body className='p-4'>
                <h2 className='h5 text-dark mb-3'>{t.preferencesTitle}</h2>
                <Form.Group controlId='settings-default-meal' className='mb-0'>
                  <Form.Label>{t.defaultMealLabel}</Form.Label>
                  <Form.Select
                    value={defaultMeal}
                    onChange={(event) => setDefaultMeal(event.target.value as MealOption)}
                    aria-label={t.defaultMealLabel}
                  >
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
          </Stack>
        </Col>
      </Row>
    </Stack>
  )
}