import { Alert, Badge, Card, Col, ListGroup, ProgressBar, Row, Stack } from 'react-bootstrap'
import { useDashboardSummary, useSessionProfile, useUpdateGoalModeMutation } from '../api/foodieApi'
import { useLanguageContext } from '../contexts/LanguageContext'
import { useSessionContext } from '../contexts/SessionContext'
import { GoalMode } from '../types/models'

const goalTone: Record<GoalMode, string> = {
  [GoalMode.GeneralHealth]: 'success',
  [GoalMode.GainStrength]: 'warning',
  [GoalMode.LoseWeight]: 'info',
}

export const DashboardPage = () => {
  const { isOnline, queuedActions, selectedGoalMode } = useSessionContext()
  const { t } = useLanguageContext()
  const sessionProfileQuery = useSessionProfile()
  const dashboardSummaryQuery = useDashboardSummary()
  const updateGoalModeMutation = useUpdateGoalModeMutation()

  if (sessionProfileQuery.isLoading || dashboardSummaryQuery.isLoading) {
    return <Alert variant="light">{t.dashboardLoading}</Alert>
  }

  if (!sessionProfileQuery.data || !dashboardSummaryQuery.data) {
    return <Alert variant="danger">{t.dashboardUnavailable}</Alert>
  }

  const { availableGoals } = sessionProfileQuery.data
  const { consumedToday, dailyTarget, focusMessage, nextMilestone, streakDays, weeklyAdherence } =
    dashboardSummaryQuery.data

  return (
    <Stack gap={4}>
      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm foodie-surface h-100">
            <Card.Body className="p-4 p-lg-5">
              <Stack direction="horizontal" className="justify-content-between align-items-start mb-4 flex-wrap gap-3">
                <div>
                  <span className="text-uppercase text-muted small fw-semibold">{t.today}</span>
                  <h1 className="display-6 fw-semibold text-dark mt-2 mb-2">
                    {t.dashboardTitle}
                  </h1>
                  <p className="text-secondary mb-0">
                    {t.dashboardDescription}
                  </p>
                </div>
                <Badge bg={isOnline ? 'success' : 'secondary'} pill className="px-3 py-2 align-self-start">
                  {isOnline ? t.onlineSyncing : t.offlineQueued(queuedActions)}
                </Badge>
              </Stack>

              <Row className="g-3">
                {availableGoals.map((goal) => (
                  <Col md={4} key={goal.mode}>
                    <button
                      type="button"
                      className={`goal-tile btn w-100 text-start ${selectedGoalMode === goal.mode ? 'goal-tile-active' : ''}`}
                      onClick={() => updateGoalModeMutation.mutate(goal.mode)}
                      aria-label={`Select ${goal.label} goal`}
                      disabled={updateGoalModeMutation.isPending}
                    >
                      <Badge bg={goalTone[goal.mode]} className="mb-3">
                        {goal.label}
                      </Badge>
                      <div className="fw-semibold text-dark mb-2">{goal.label}</div>
                      <div className="text-secondary small">{goal.description}</div>
                    </button>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm foodie-accent h-100">
            <Card.Body className="p-4">
              <p className="small text-uppercase fw-semibold text-success-emphasis mb-2">{t.focus}</p>
              <h2 className="h4 text-dark mb-3">{t.nextBestAction}</h2>
              <p className="text-secondary mb-4">{focusMessage}</p>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 bg-transparent d-flex justify-content-between">
                  <span>{t.streak}</span>
                  <strong>{t.days(streakDays)}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 bg-transparent d-flex justify-content-between">
                  <span>{t.weeklyAdherence}</span>
                  <strong>{weeklyAdherence}%</strong>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 bg-transparent">
                  <strong className="d-block mb-1">{t.milestone}</strong>
                  <span className="text-secondary">{nextMilestone}</span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6} xl={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-uppercase text-muted fw-semibold mb-2">{t.calories}</div>
              <div className="fs-2 fw-semibold text-dark">{consumedToday.calories}</div>
              <div className="text-secondary">{t.target(dailyTarget.calories)}</div>
              <ProgressBar now={(consumedToday.calories / dailyTarget.calories) * 100} className="mt-3" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-uppercase text-muted fw-semibold mb-2">{t.protein}</div>
              <div className="fs-2 fw-semibold text-dark">{consumedToday.protein}g</div>
              <div className="text-secondary">{t.target(dailyTarget.protein)}g</div>
              <ProgressBar variant="success" now={(consumedToday.protein / dailyTarget.protein) * 100} className="mt-3" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-uppercase text-muted fw-semibold mb-2">{t.carbs}</div>
              <div className="fs-2 fw-semibold text-dark">{consumedToday.carbs}g</div>
              <div className="text-secondary">{t.target(dailyTarget.carbs)}g</div>
              <ProgressBar variant="warning" now={(consumedToday.carbs / dailyTarget.carbs) * 100} className="mt-3" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-uppercase text-muted fw-semibold mb-2">{t.fat}</div>
              <div className="fs-2 fw-semibold text-dark">{consumedToday.fat}g</div>
              <div className="text-secondary">{t.target(dailyTarget.fat)}g</div>
              <ProgressBar variant="info" now={(consumedToday.fat / dailyTarget.fat) * 100} className="mt-3" />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Stack>
  )
}