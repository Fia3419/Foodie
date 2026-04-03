import { useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, Row, Stack } from 'react-bootstrap'
import { useCreateMealLogMutation, useDailyLog, useDeleteMealLogMutation, useUpdateMealLogMutation } from '../api/foodieApi'
import { useLanguageContext } from '../contexts/LanguageContext'
import { useSessionContext } from '../contexts/SessionContext'
import { getLocalDateInputValue, getLocalTimeInputValue } from '../lib/dateTime'
import { parseNumberInput } from '../lib/numberInput'
import { CreateMealLogEntryRequest, MealLogItem } from '../types/models'

interface FoodLogFormValues extends Omit<CreateMealLogEntryRequest, 'calories' | 'protein' | 'carbs' | 'fat'> {
  calories: string
  protein: string
  carbs: string
  fat: string
}

const createInitialForm = (): FoodLogFormValues => ({
  mealName: 'Breakfast',
  foodName: '',
  calories: '0',
  protein: '0',
  carbs: '0',
  fat: '0',
  logDate: getLocalDateInputValue(),
  loggedAt: getLocalTimeInputValue(),
})

const toCreateMealLogEntryRequest = (formValues: FoodLogFormValues): CreateMealLogEntryRequest => ({
  ...formValues,
  calories: parseNumberInput(formValues.calories),
  protein: parseNumberInput(formValues.protein),
  carbs: parseNumberInput(formValues.carbs),
  fat: parseNumberInput(formValues.fat),
})

const toFoodLogFormValues = (item: MealLogItem, logDate: string): FoodLogFormValues => ({
  mealName: item.mealName,
  foodName: item.foodName,
  calories: String(item.calories),
  protein: String(item.protein),
  carbs: String(item.carbs),
  fat: String(item.fat),
  logDate,
  loggedAt: item.loggedAt,
})

export const FoodLogPage = () => {
  const { isOnline } = useSessionContext()
  const { t } = useLanguageContext()
  const dailyLogQuery = useDailyLog()
  const createMealLogMutation = useCreateMealLogMutation()
  const updateMealLogMutation = useUpdateMealLogMutation()
  const deleteMealLogMutation = useDeleteMealLogMutation()
  const [formValues, setFormValues] = useState<FoodLogFormValues>(createInitialForm)
  const [editingMealLogId, setEditingMealLogId] = useState<string | null>(null)

  const resetForm = () => {
    setEditingMealLogId(null)
    setFormValues(createInitialForm())
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const request = toCreateMealLogEntryRequest(formValues)

    if (editingMealLogId) {
      updateMealLogMutation.mutate(
        { id: editingMealLogId, request },
        {
          onSuccess: () => {
            resetForm()
          },
        },
      )

      return
    }

    createMealLogMutation.mutate(request, {
      onSuccess: () => {
        resetForm()
      },
    })
  }

  const handleEdit = (item: MealLogItem) => {
    if (!dailyLogQuery.data) {
      return
    }

    setEditingMealLogId(item.id)
    setFormValues(toFoodLogFormValues(item, dailyLogQuery.data.date))
  }

  const handleDelete = (id: string) => {
    deleteMealLogMutation.mutate(id, {
      onSuccess: () => {
        if (editingMealLogId === id) {
          resetForm()
        }
      },
    })
  }

  const isSaving = createMealLogMutation.isPending || updateMealLogMutation.isPending

  if (dailyLogQuery.isLoading) {
    return <Alert variant="light">{t.foodLogLoading}</Alert>
  }

  if (!dailyLogQuery.data) {
    return <Alert variant="danger">{t.foodLogUnavailable}</Alert>
  }

  return (
    <Stack gap={4}>
      <Card className="border-0 shadow-sm foodie-surface">
        <Card.Body className="p-4 d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center">
          <div>
            <p className="small text-uppercase text-muted fw-semibold mb-2">{t.dailyLog}</p>
            <h1 className="h2 text-dark mb-2">{t.mealsAndMacros}</h1>
            <p className="text-secondary mb-0">{t.logDescription}</p>
          </div>
          <Badge bg={isOnline ? 'success' : 'warning'} className="align-self-start align-self-lg-center">
            {isOnline ? t.onlineWrites : t.offlineWrites}
          </Badge>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              {editingMealLogId ? (
                <Col xs={12}>
                  <Alert variant="warning" className="mb-0">
                    {t.foodLogEditDescription}
                  </Alert>
                </Col>
              ) : null}
              <Col md={3}>
                <Form.Group controlId="meal-name">
                  <Form.Label>{t.meal}</Form.Label>
                  <select
                    className="form-select"
                    aria-label="Meal selection"
                    title="Meal selection"
                    name="mealName"
                    value={formValues.mealName}
                    onChange={(event) => setFormValues((currentValue) => ({ ...currentValue, mealName: event.target.value }))}
                  >
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snack</option>
                  </select>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group controlId="food-name">
                  <Form.Label>{t.food}</Form.Label>
                  <Form.Control
                    value={formValues.foodName}
                    onChange={(event) => setFormValues((currentValue) => ({ ...currentValue, foodName: event.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="logged-date">
                  <Form.Label>{t.date}</Form.Label>
                  <Form.Control
                    type="date"
                    value={formValues.logDate}
                    onChange={(event) => setFormValues((currentValue) => ({ ...currentValue, logDate: event.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="logged-time">
                  <Form.Label>{t.time}</Form.Label>
                  <Form.Control
                    type="time"
                    value={formValues.loggedAt}
                    onChange={(event) => setFormValues((currentValue) => ({ ...currentValue, loggedAt: event.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col sm={6} md={3}>
                <Form.Group controlId="calories">
                  <Form.Label>{t.calories}</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={formValues.calories}
                    onChange={(event) => setFormValues((currentValue) => ({ ...currentValue, calories: event.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col sm={6} md={3}>
                <Form.Group controlId="protein">
                  <Form.Label>{t.protein}</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={formValues.protein}
                    onChange={(event) => setFormValues((currentValue) => ({ ...currentValue, protein: event.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col sm={6} md={3}>
                <Form.Group controlId="carbs">
                  <Form.Label>{t.carbs}</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={formValues.carbs}
                    onChange={(event) => setFormValues((currentValue) => ({ ...currentValue, carbs: event.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col sm={6} md={3}>
                <Form.Group controlId="fat">
                  <Form.Label>{t.fat}</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={formValues.fat}
                    onChange={(event) => setFormValues((currentValue) => ({ ...currentValue, fat: event.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              {editingMealLogId ? <Button type="button" variant="outline-secondary" onClick={resetForm}>{t.cancelEdit}</Button> : null}
              <Button type="submit" variant="success" disabled={isSaving}>
                {isSaving ? t.saving : editingMealLogId ? t.updateFoodEntry : t.addFoodEntry}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {dailyLogQuery.data.items.map((item) => (
          <Col lg={6} key={item.id}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <Stack direction="horizontal" className="justify-content-between align-items-start mb-3">
                  <div>
                    <Badge bg="light" text="dark" className="mb-2">
                      {item.mealName}
                    </Badge>
                    <h2 className="h5 text-dark mb-1">{item.foodName}</h2>
                    <p className="text-secondary small mb-0">{t.loggedAt(item.loggedAt)}</p>
                  </div>
                  <div className="text-end">
                    <div className="fw-semibold text-dark">{item.calories} kcal</div>
                    <div className="small text-secondary">P {item.protein} / C {item.carbs} / F {item.fat}</div>
                  </div>
                </Stack>
                <div className="macro-chip-row d-flex flex-wrap gap-2">
                  <span className="macro-chip">Protein {item.protein}g</span>
                  <span className="macro-chip">Carbs {item.carbs}g</span>
                  <span className="macro-chip">Fat {item.fat}g</span>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button variant="outline-secondary" size="sm" type="button" onClick={() => handleEdit(item)}>
                    {t.editFoodEntry}
                  </Button>
                  <Button variant="outline-danger" size="sm" type="button" onClick={() => handleDelete(item.id)} disabled={deleteMealLogMutation.isPending}>
                    {t.deleteFoodEntry}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Stack>
  )
}