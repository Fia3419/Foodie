import { Alert, Badge, Card, Col, ListGroup, ProgressBar, Row, Stack } from 'react-bootstrap'
import { useDashboardSummary, useSessionProfile, useUpdateGoalModeMutation } from '../api/foodieApi'
import { DashboardIllustration, FoodieIcon, type FoodieIconName } from '../components/ColorfulVisuals'
import { useLanguageContext } from '../contexts/LanguageContext'
import { useSessionContext } from '../contexts/SessionContext'
import { GoalMode } from '../types/models'

const goalTone: Record<GoalMode, string> = {
  [GoalMode.GeneralHealth]: 'success',
  [GoalMode.GainStrength]: 'warning',
  [GoalMode.LoseWeight]: 'info',
}

const goalIcon: Record<GoalMode, FoodieIconName> = {
  [GoalMode.GeneralHealth]: 'target',
  [GoalMode.GainStrength]: 'protein',
  [GoalMode.LoseWeight]: 'progress',
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
  const metricCards = [
    {
      label: t.calories,
      value: `${consumedToday.calories}`,
      target: t.target(dailyTarget.calories),
      progress: (consumedToday.calories / dailyTarget.calories) * 100,
      icon: 'calories',
      variant: undefined,
      className: 'foodie-metric-card-calories',
    },
    {
      label: t.protein,
      value: `${consumedToday.protein}g`,
      target: `${t.target(dailyTarget.protein)}g`,
      progress: (consumedToday.protein / dailyTarget.protein) * 100,
      icon: 'protein',
      variant: 'success',
      className: 'foodie-metric-card-protein',
    },
    {
      label: t.carbs,
      value: `${consumedToday.carbs}g`,
      target: `${t.target(dailyTarget.carbs)}g`,
      progress: (consumedToday.carbs / dailyTarget.carbs) * 100,
      icon: 'carbs',
      variant: 'warning',
      className: 'foodie-metric-card-carbs',
    },
    {
      label: t.fat,
      value: `${consumedToday.fat}g`,
      target: `${t.target(dailyTarget.fat)}g`,
      progress: (consumedToday.fat / dailyTarget.fat) * 100,
      icon: 'fat',
      variant: 'info',
      className: 'foodie-metric-card-fat',
    },
  ] satisfies Array<{
    label: string
    value: string
    target: string
    progress: number
    icon: FoodieIconName
    variant?: 'success' | 'warning' | 'info'
    className: string
  }>

  return (
    <Stack gap={4}>
      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm foodie-surface h-100">
            <Card.Body className="p-4 p-lg-5">
              <Stack direction="horizontal" className="justify-content-between align-items-start mb-4 flex-wrap gap-3">
                <div>
                  <span className="text-uppercase text-muted small fw-semibold foodie-kicker">{t.today}</span>
                  <h1 className="display-6 fw-semibold text-dark mt-2 mb-2">
                    {t.dashboardTitle}
                  </h1>
                  <p className="text-secondary mb-0">
                    {t.dashboardDescription}
                  </p>
                </div>
                <div className="foodie-dashboard-visual" aria-hidden="true">
                  <DashboardIllustration />
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
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <span className="foodie-goal-icon">
                          <FoodieIcon name={goalIcon[goal.mode]} className="foodie-inline-icon" />
                        </span>
                        <Badge bg={goalTone[goal.mode]}>
                          {goal.label}
                        </Badge>
                      </div>
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
              <p className="small text-uppercase fw-semibold text-success-emphasis mb-2 foodie-kicker">{t.focus}</p>
              <h2 className="h4 text-dark mb-3">{t.nextBestAction}</h2>
              <p className="text-secondary mb-4">{focusMessage}</p>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 bg-transparent d-flex justify-content-between align-items-center foodie-focus-item">
                  <span className="d-inline-flex align-items-center gap-2"><FoodieIcon name="streak" className="foodie-inline-icon foodie-inline-icon-accent" />{t.streak}</span>
                  <strong>{t.days(streakDays)}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 bg-transparent d-flex justify-content-between align-items-center foodie-focus-item">
                  <span className="d-inline-flex align-items-center gap-2"><FoodieIcon name="target" className="foodie-inline-icon foodie-inline-icon-accent" />{t.weeklyAdherence}</span>
                  <strong>{weeklyAdherence}%</strong>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 bg-transparent foodie-focus-item">
                  <strong className="d-flex align-items-center gap-2 mb-1"><FoodieIcon name="milestone" className="foodie-inline-icon foodie-inline-icon-accent" />{t.milestone}</strong>
                  <span className="text-secondary">{nextMilestone}</span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {metricCards.map((metric) => (
          <Col md={6} xl={3} key={metric.label}>
            <Card className={`border-0 shadow-sm h-100 foodie-metric-card ${metric.className}`}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-3 gap-3">
                  <div className="small text-uppercase text-muted fw-semibold">{metric.label}</div>
                  <span className="foodie-metric-icon">
                    <FoodieIcon name={metric.icon} className="foodie-inline-icon" />
                  </span>
                </div>
                <div className="fs-2 fw-semibold text-dark">{metric.value}</div>
                <div className="text-secondary">{metric.target}</div>
                <ProgressBar variant={metric.variant} now={metric.progress} className="mt-3" />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Stack>
  )
}