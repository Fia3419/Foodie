import { useState } from 'react'
import { Alert, Button, Card, Col, Form, ProgressBar, Row, Stack, Table } from 'react-bootstrap'
import { useCreateWeightEntryMutation, useDashboardSummary, useWeightTrend } from '../api/foodieApi'
import { FoodieIcon, ProgressIllustration } from '../components/ColorfulVisuals'
import { useLanguageContext } from '../contexts/LanguageContext'
import { getLocalDateInputValue } from '../lib/dateTime'
import { parseNumberInput } from '../lib/numberInput'
import { CreateWeightEntryRequest } from '../types/models'

interface WeightFormValues extends Omit<CreateWeightEntryRequest, 'weightKg'> {
  weightKg: string
}

const createInitialWeightForm = (): WeightFormValues => ({
  date: getLocalDateInputValue(),
  weightKg: '0',
})

const toCreateWeightEntryRequest = (formValues: WeightFormValues): CreateWeightEntryRequest => ({
  ...formValues,
  weightKg: parseNumberInput(formValues.weightKg),
})

export const ProgressPage = () => {
  const { t } = useLanguageContext()
  const dashboardSummaryQuery = useDashboardSummary()
  const weightTrendQuery = useWeightTrend()
  const createWeightEntryMutation = useCreateWeightEntryMutation()
  const [formValues, setFormValues] = useState<WeightFormValues>(createInitialWeightForm)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createWeightEntryMutation.mutate(toCreateWeightEntryRequest(formValues), {
      onSuccess: () => {
        setFormValues(createInitialWeightForm())
      },
    })
  }

  if (dashboardSummaryQuery.isLoading || weightTrendQuery.isLoading) {
    return <Alert variant="light">{t.progressLoading}</Alert>
  }

  if (!dashboardSummaryQuery.data || !weightTrendQuery.data) {
    return <Alert variant="danger">{t.progressUnavailable}</Alert>
  }

  const weightEntries = weightTrendQuery.data
  const latestWeight = weightEntries.at(-1)?.weightKg ?? null
  const startingWeight = weightEntries[0]?.weightKg ?? null
  const weightDelta = latestWeight !== null && startingWeight !== null ? Number((latestWeight - startingWeight).toFixed(1)) : null
  const summaryCards = [
    {
      label: t.weight,
      value: latestWeight !== null ? `${latestWeight.toFixed(1)} kg` : '—',
      helper: weightEntries.length > 0 ? weightEntries.at(-1)?.date ?? '—' : '—',
      icon: 'scale',
      className: 'foodie-progress-card-weight',
    },
    {
      label: t.weeklyAdherence,
      value: `${dashboardSummaryQuery.data.weeklyAdherence}%`,
      helper: t.nextBestAction,
      icon: 'target',
      className: 'foodie-progress-card-adherence',
    },
    {
      label: t.streak,
      value: t.days(dashboardSummaryQuery.data.streakDays),
      helper: t.focus,
      icon: 'streak',
      className: 'foodie-progress-card-streak',
    },
    {
      label: t.milestone,
      value: weightDelta === null ? '—' : `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} kg`,
      helper: dashboardSummaryQuery.data.nextMilestone,
      icon: 'milestone',
      className: 'foodie-progress-card-milestone',
    },
  ] as const

  return (
    <Stack gap={4}>
      <Card className="border-0 shadow-sm foodie-surface">
        <Card.Body className="p-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div>
            <p className="small text-uppercase text-muted fw-semibold mb-2 foodie-kicker">{t.progress}</p>
            <h1 className="h2 text-dark mb-2">{t.progressTitle}</h1>
            <p className="text-secondary mb-4">
              {t.progressDescription}
            </p>
            <div className="foodie-progress-bar-wrap">
              <div className="small text-uppercase text-muted fw-semibold mb-2">{t.weeklyAdherence}</div>
              <ProgressBar now={dashboardSummaryQuery.data.weeklyAdherence} label={`${dashboardSummaryQuery.data.weeklyAdherence}%`} />
            </div>
          </div>
          <div className="foodie-page-visual" aria-hidden="true">
            <ProgressIllustration />
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {summaryCards.map((card) => (
          <Col md={6} xl={3} key={card.label}>
            <Card className={`border-0 shadow-sm h-100 foodie-progress-card ${card.className}`}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                  <div className="small text-uppercase text-muted fw-semibold">{card.label}</div>
                  <span className="foodie-metric-icon">
                    <FoodieIcon name={card.icon} className="foodie-inline-icon" />
                  </span>
                </div>
                <div className="fs-3 fw-semibold text-dark mb-1">{card.value}</div>
                <div className="text-secondary small">{card.helper}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100 foodie-section-card foodie-section-card-sky">
            <Card.Body className="p-4">
              <div className="d-flex align-items-start gap-3 mb-3">
                <span className="foodie-heading-icon">
                  <FoodieIcon name="progress" className="foodie-inline-icon" />
                </span>
                <div>
                  <h2 className="h5 text-dark mb-1">{t.weightTrend}</h2>
                  <p className="text-secondary small mb-0">{dashboardSummaryQuery.data.nextMilestone}</p>
                </div>
              </div>
              <Table responsive className="align-middle mb-0 foodie-progress-table">
                <thead>
                  <tr>
                    <th>{t.date}</th>
                    <th>{t.weight}</th>
                  </tr>
                </thead>
                <tbody>
                  {weightEntries.length > 0 ? weightEntries.map((entry, index) => (
                    <tr key={entry.date}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="foodie-heading-icon foodie-heading-icon-small">
                            <FoodieIcon name={index === weightEntries.length - 1 ? 'scale' : 'progress'} className="foodie-inline-icon" />
                          </span>
                          <span>{entry.date}</span>
                        </div>
                      </td>
                      <td className="fw-semibold text-dark">{entry.weightKg.toFixed(1)} kg</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={2} className="text-secondary">{t.progressDescription}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100 foodie-section-card foodie-section-card-warm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-start gap-3 mb-3">
                <span className="foodie-heading-icon">
                  <FoodieIcon name="scale" className="foodie-inline-icon" />
                </span>
                <div>
                  <h2 className="h5 text-dark mb-1">{t.logBodyWeight}</h2>
                  <p className="text-secondary small mb-0">{t.progressDescription}</p>
                </div>
              </div>
              <Form onSubmit={handleSubmit}>
                <Stack gap={3}>
                  <Form.Group controlId="weight-date">
                    <Form.Label>{t.date}</Form.Label>
                    <Form.Control
                      type="date"
                      value={formValues.date}
                      onChange={(event) => setFormValues((currentValue) => ({ ...currentValue, date: event.target.value }))}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="weight-value">
                    <Form.Label>{t.weight} (kg)</Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      step="0.1"
                      inputMode="decimal"
                      value={formValues.weightKg}
                      onChange={(event) => setFormValues((currentValue) => ({ ...currentValue, weightKg: event.target.value }))}
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="outline-success" disabled={createWeightEntryMutation.isPending}>
                    {createWeightEntryMutation.isPending ? t.saving : t.saveWeightEntry}
                  </Button>
                </Stack>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Stack>
  )
}