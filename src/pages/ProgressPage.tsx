import { useState } from 'react'
import { Alert, Button, Card, Col, Form, ProgressBar, Row, Stack, Table } from 'react-bootstrap'
import { useCreateWeightEntryMutation, useDashboardSummary, useWeightTrend } from '../api/foodieApi'
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

  return (
    <Stack gap={4}>
      <Card className="border-0 shadow-sm foodie-surface">
        <Card.Body className="p-4">
          <p className="small text-uppercase text-muted fw-semibold mb-2">{t.progress}</p>
          <h1 className="h2 text-dark mb-2">{t.progressTitle}</h1>
          <p className="text-secondary mb-4">
            {t.progressDescription}
          </p>
          <ProgressBar now={dashboardSummaryQuery.data.weeklyAdherence} label={`${dashboardSummaryQuery.data.weeklyAdherence}%`} />
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <h2 className="h5 text-dark mb-3">{t.weightTrend}</h2>
              <Table responsive className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>{t.date}</th>
                    <th>{t.weight}</th>
                  </tr>
                </thead>
                <tbody>
                  {weightTrendQuery.data.map((entry) => (
                    <tr key={entry.date}>
                      <td>{entry.date}</td>
                      <td>{entry.weightKg.toFixed(1)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <h2 className="h5 text-dark mb-3">{t.logBodyWeight}</h2>
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