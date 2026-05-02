import { useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, Row, Stack } from 'react-bootstrap'
import {
  useCreateMealLogMutation,
  useCreateSavedFoodMutation,
  useDailyLog,
  useDeleteMealLogMutation,
  useDeleteSavedFoodMutation,
  useLookupSavedFoodByBarcodeMutation,
  useRecentMeals,
  useSavedFoods,
  useUpdateMealLogMutation,
  useUpdateSavedFoodMutation,
} from '../api/foodieApi'
import { BarcodeScanner } from '../components/BarcodeScanner'
import { FoodLogIllustration, FoodieIcon } from '../components/ColorfulVisuals'
import { SavedFoodSection } from '../components/SavedFoodSection'
import { useLanguageContext } from '../contexts/LanguageContext'
import { useSessionContext } from '../contexts/SessionContext'
import { getLocalDateInputValue, getLocalTimeInputValue, shiftLocalDateInputValue } from '../lib/dateTime'
import { DEFAULT_MEAL, MEAL_OPTIONS } from '../lib/mealOptions'
import { parseNumberInput } from '../lib/numberInput'
import { CreateMealLogEntryRequest, MealLogItem, SavedFoodKind, SavedFoodSummary, UpsertSavedFoodRequest } from '../types/models'

interface FoodLogFormValues extends Omit<CreateMealLogEntryRequest, 'calories' | 'protein' | 'carbs' | 'fat'> {
  calories: string
  protein: string
  carbs: string
  fat: string
}

interface QuickFillValues {
  mealName: string
  foodName: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

const createInitialForm = (): FoodLogFormValues => ({
  mealName: DEFAULT_MEAL,
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

const toSavedFoodRequest = (formValues: FoodLogFormValues, kind: SavedFoodKind, barcode: string): UpsertSavedFoodRequest => ({
  kind,
  name: formValues.foodName.trim(),
  mealName: formValues.mealName,
  barcode: kind === 'packaged' ? barcode : undefined,
  calories: parseNumberInput(formValues.calories),
  protein: parseNumberInput(formValues.protein),
  carbs: parseNumberInput(formValues.carbs),
  fat: parseNumberInput(formValues.fat),
})

export const FoodLogPage = () => {
  const { isOnline } = useSessionContext()
  const { t } = useLanguageContext()
  const dailyLogQuery = useDailyLog()
  const [yesterdayCopyTriggered, setYesterdayCopyTriggered] = useState(false)
  const yesterdayLogQuery = useDailyLog(
    shiftLocalDateInputValue(getLocalDateInputValue(), -1),
    { enabled: yesterdayCopyTriggered },
  )
  const recentMealsQuery = useRecentMeals()
  const savedFoodsQuery = useSavedFoods()
  const createMealLogMutation = useCreateMealLogMutation()
  const updateMealLogMutation = useUpdateMealLogMutation()
  const deleteMealLogMutation = useDeleteMealLogMutation()
  const createSavedFoodMutation = useCreateSavedFoodMutation()
  const deleteSavedFoodMutation = useDeleteSavedFoodMutation()
  const updateSavedFoodMutation = useUpdateSavedFoodMutation()
  const lookupSavedFoodByBarcodeMutation = useLookupSavedFoodByBarcodeMutation()
  const [formValues, setFormValues] = useState<FoodLogFormValues>(createInitialForm)
  const [editingMealLogId, setEditingMealLogId] = useState<string | null>(null)
  const [editingSavedFood, setEditingSavedFood] = useState<SavedFoodSummary | null>(null)
  const [barcodeValue, setBarcodeValue] = useState('')
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isRepeatingLatest, setIsRepeatingLatest] = useState(false)
  const [isCopyingYesterday, setIsCopyingYesterday] = useState(false)
  const [barcodeLookupResult, setBarcodeLookupResult] = useState<'saved' | 'external' | 'not-found' | null>(null)

  const favorites = savedFoodsQuery.data?.filter((item) => item.kind === 'favorite') ?? []
  const templates = savedFoodsQuery.data?.filter((item) => item.kind === 'template') ?? []
  const packagedFoods = savedFoodsQuery.data?.filter((item) => item.kind === 'packaged') ?? []

  const resetForm = () => {
    setEditingMealLogId(null)
    setEditingSavedFood(null)
    setBarcodeValue('')
    setBarcodeLookupResult(null)
    setFormValues(createInitialForm())
  }

  const applyQuickFill = (values: QuickFillValues) => {
    setEditingMealLogId(null)
    setEditingSavedFood(null)
    setFormValues((currentValue) => ({
      ...currentValue,
      mealName: values.mealName,
      foodName: values.foodName,
      calories: String(values.calories),
      protein: String(values.protein),
      carbs: String(values.carbs),
      fat: String(values.fat),
      loggedAt: getLocalTimeInputValue(),
    }))
  }

  const applySavedFood = (savedFood: SavedFoodSummary) => {
    applyQuickFill({
      mealName: savedFood.mealName,
      foodName: savedFood.name,
      calories: savedFood.calories,
      protein: savedFood.protein,
      carbs: savedFood.carbs,
      fat: savedFood.fat,
    })

    setBarcodeValue(savedFood.barcode ?? '')
    setBarcodeLookupResult(savedFood.isSaved ? 'saved' : 'external')
  }

  const handleEditSavedFood = (savedFood: SavedFoodSummary) => {
    setEditingMealLogId(null)
    setEditingSavedFood(savedFood)
    setBarcodeLookupResult(savedFood.isSaved ? 'saved' : 'external')
    setBarcodeValue(savedFood.barcode ?? '')
    setFormValues((currentValue) => ({
      ...currentValue,
      mealName: savedFood.mealName,
      foodName: savedFood.name,
      calories: String(savedFood.calories),
      protein: String(savedFood.protein),
      carbs: String(savedFood.carbs),
      fat: String(savedFood.fat),
      loggedAt: getLocalTimeInputValue(),
    }))
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

  const handleSaveCurrentFood = (kind: SavedFoodKind) => {
    setBarcodeLookupResult(null)
    createSavedFoodMutation.mutate(toSavedFoodRequest(formValues, kind, barcodeValue.trim()))
  }

  const handleUpdateSavedFood = () => {
    if (!editingSavedFood) {
      return
    }

    updateSavedFoodMutation.mutate(
      {
        id: editingSavedFood.id,
        request: toSavedFoodRequest(formValues, editingSavedFood.kind, barcodeValue.trim()),
      },
      {
        onSuccess: () => {
          resetForm()
        },
      },
    )
  }

  const handleRepeatLatestMeal = async () => {
    const latestItem = recentMealsQuery.data?.[0]

    if (!latestItem) {
      return
    }

    setIsRepeatingLatest(true)

    try {
      await createMealLogMutation.mutateAsync({
        mealName: latestItem.mealName,
        foodName: latestItem.foodName,
        calories: latestItem.calories,
        protein: latestItem.protein,
        carbs: latestItem.carbs,
        fat: latestItem.fat,
        logDate: getLocalDateInputValue(),
        loggedAt: getLocalTimeInputValue(),
      })
    } finally {
      setIsRepeatingLatest(false)
    }
  }

  const handleCopyYesterday = async () => {
    setIsCopyingYesterday(true)

    try {
      if (!yesterdayCopyTriggered) {
        setYesterdayCopyTriggered(true)
      }

      const items = yesterdayLogQuery.data?.items
        ?? (await yesterdayLogQuery.refetch()).data?.items
        ?? []

      if (items.length === 0) {
        return
      }

      for (const item of items) {
        await createMealLogMutation.mutateAsync({
          mealName: item.mealName,
          foodName: item.foodName,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          logDate: getLocalDateInputValue(),
          loggedAt: item.loggedAt,
        })
      }
    } finally {
      setIsCopyingYesterday(false)
    }
  }

  const handleBarcodeLookup = () => {
    const normalizedBarcode = barcodeValue.trim()

    if (!normalizedBarcode) {
      return
    }

    lookupSavedFoodByBarcodeMutation.mutate(normalizedBarcode, {
      onSuccess: (savedFood) => {
        applySavedFood(savedFood)
      },
      onError: () => {
        setBarcodeLookupResult('not-found')
      },
    })
  }

  const handleEdit = (item: MealLogItem) => {
    if (!dailyLogQuery.data) {
      return
    }

    setEditingMealLogId(item.id)
    setEditingSavedFood(null)
    setBarcodeLookupResult(null)
    setBarcodeValue('')
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

  const canSaveCurrentFood = formValues.foodName.trim().length >= 2
  const canSavePackagedFood = canSaveCurrentFood && barcodeValue.trim().length > 0
  const isSaving = createMealLogMutation.isPending || updateMealLogMutation.isPending
  const isSavingShortcut = createSavedFoodMutation.isPending || updateSavedFoodMutation.isPending

  if (dailyLogQuery.isLoading) {
    return <Alert variant="light">{t.foodLogLoading}</Alert>
  }

  if (!dailyLogQuery.data) {
    return <Alert variant="danger">{t.foodLogUnavailable}</Alert>
  }

  return (
    <>
      <BarcodeScanner
        show={isScannerOpen}
        onHide={() => setIsScannerOpen(false)}
        onDetected={(barcode) => {
          setBarcodeValue(barcode)
          lookupSavedFoodByBarcodeMutation.mutate(barcode, {
            onSuccess: (savedFood) => {
              applySavedFood(savedFood)
            },
            onError: () => {
              setBarcodeLookupResult('not-found')
            },
          })
        }}
      />

      <Stack gap={4}>
        <Card className="border-0 shadow-sm foodie-surface">
          <Card.Body className="p-4 d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center">
            <div>
              <p className="small text-uppercase text-muted fw-semibold mb-2 foodie-kicker">{t.dailyLog}</p>
              <h1 className="h2 text-dark mb-2">{t.mealsAndMacros}</h1>
              <p className="text-secondary mb-0">{t.logDescription}</p>
            </div>
            <div className="foodie-page-visual" aria-hidden="true">
              <FoodLogIllustration />
            </div>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm foodie-section-card foodie-section-card-warm">
          <Card.Body className="p-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
              <div>
                <h2 className="h4 text-dark mb-2 d-flex align-items-center gap-2">
                  <span className="foodie-heading-icon"><FoodieIcon name="spark" className="foodie-inline-icon" /></span>
                  {t.quickActions}
                </h2>
                <p className="text-secondary mb-0">{t.quickActionsDescription}</p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <Button variant="outline-success" type="button" onClick={() => void handleRepeatLatestMeal()} disabled={isRepeatingLatest || !recentMealsQuery.data?.length}>
                  {t.repeatLatestMeal}
                </Button>
                <Button variant="outline-secondary" type="button" onClick={() => void handleCopyYesterday()} disabled={isCopyingYesterday || yesterdayLogQuery.isFetching}>
                  {t.copyYesterday}
                </Button>
              </div>
            </div>

          <Row className="g-4">
            <Col lg={5}>
              <Card className="border-0 h-100 foodie-soft-card foodie-soft-card-gold">
                <Card.Body className="p-3 d-flex flex-column gap-3">
                  <div>
                    <h3 className="h6 text-dark mb-2 d-flex align-items-center gap-2">
                      <span className="foodie-heading-icon foodie-heading-icon-small"><FoodieIcon name="barcode" className="foodie-inline-icon" /></span>
                      {t.barcode}
                    </h3>
                    <p className="text-secondary small mb-0">{t.quickActionsDescription}</p>
                  </div>
                  <Form.Control value={barcodeValue} onChange={(event) => setBarcodeValue(event.target.value)} placeholder="0123456789012" inputMode="numeric" />
                  <div className="d-flex flex-wrap gap-2">
                    <Button variant="outline-dark" type="button" onClick={handleBarcodeLookup} disabled={lookupSavedFoodByBarcodeMutation.isPending || !barcodeValue.trim()}>
                      {t.lookupBarcode}
                    </Button>
                    <Button variant="outline-dark" type="button" onClick={() => setIsScannerOpen(true)}>
                      {t.scanBarcode}
                    </Button>
                  </div>
                  {barcodeLookupResult === 'external' ? <Alert variant="success" className="mb-0">{t.externalBarcodeResult}</Alert> : null}
                  {barcodeLookupResult === 'not-found' ? <Alert variant="warning" className="mb-0">{t.barcodeLookupNotFound}</Alert> : null}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={7}>
              <Card className="border-0 h-100 foodie-soft-card foodie-soft-card-sky">
                <Card.Body className="p-3 d-flex flex-column gap-3">
                  <div>
                    <h3 className="h6 text-dark mb-2 d-flex align-items-center gap-2">
                      <span className="foodie-heading-icon foodie-heading-icon-small"><FoodieIcon name="foodLog" className="foodie-inline-icon" /></span>
                      {t.recentMeals}
                    </h3>
                    <p className="text-secondary small mb-0">{t.repeatLatestMeal}</p>
                  </div>
                  <Stack gap={2}>
                    {recentMealsQuery.data?.length ? recentMealsQuery.data.map((item) => (
                      <div key={item.id} className="d-flex flex-wrap justify-content-between gap-2 align-items-center rounded border bg-white px-3 py-2">
                        <div>
                          <div className="fw-semibold text-dark">{item.foodName}</div>
                          <div className="small text-secondary">{item.mealName} · {item.calories} kcal</div>
                        </div>
                        <Button variant="outline-success" size="sm" type="button" onClick={() => applyQuickFill(item)}>
                          {t.useSavedFood}
                        </Button>
                      </div>
                    )) : <Alert variant="light" className="mb-0">{t.noRecentMeals}</Alert>}
                  </Stack>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <SavedFoodSection
                title={t.favorites}
                emptyMessage={t.noFavorites}
                items={favorites}
                getSecondaryText={(savedFood) => `${savedFood.calories} kcal`}
                useLabel={t.useSavedFood}
                editLabel={t.editFoodEntry}
                deleteLabel={t.deleteFoodEntry}
                onUse={applySavedFood}
                onDelete={(id) => deleteSavedFoodMutation.mutate(id)}
              />
            </Col>

            <Col lg={4}>
              <SavedFoodSection
                title={t.templates}
                emptyMessage={t.noTemplates}
                items={templates}
                getSecondaryText={(savedFood) => savedFood.mealName}
                useLabel={t.useSavedFood}
                editLabel={t.editFoodEntry}
                deleteLabel={t.deleteFoodEntry}
                onUse={applySavedFood}
                onDelete={(id) => deleteSavedFoodMutation.mutate(id)}
              />
            </Col>

            <Col lg={4}>
              <SavedFoodSection
                title={t.packagedFoods}
                emptyMessage={t.noPackagedFoods}
                items={packagedFoods}
                getSecondaryText={(savedFood) => savedFood.barcode ?? ''}
                showEditButton
                useLabel={t.useSavedFood}
                editLabel={t.editFoodEntry}
                deleteLabel={t.deleteFoodEntry}
                onUse={applySavedFood}
                onEdit={handleEditSavedFood}
                onDelete={(id) => deleteSavedFoodMutation.mutate(id)}
              />
            </Col>
          </Row>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm foodie-section-card foodie-section-card-mint">
          <Card.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <div className="mb-4">
                <h2 className="h4 text-dark mb-2 d-flex align-items-center gap-2">
                  <span className="foodie-heading-icon"><FoodieIcon name="foodLog" className="foodie-inline-icon" /></span>
                  {editingMealLogId ? t.updateFoodEntry : t.addFoodEntry}
                </h2>
                <p className="text-secondary mb-0">{t.logDescription}</p>
              </div>
              <Row className="g-3">
                {editingMealLogId ? (
                  <Col xs={12}>
                    <Alert variant="warning" className="mb-0">
                      {t.foodLogEditDescription}
                    </Alert>
                  </Col>
                ) : null}
                {editingSavedFood ? (
                  <Col xs={12}>
                    <Alert variant="info" className="mb-0">
                      {t.editingSavedFood}
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
                    {MEAL_OPTIONS.map((meal) => <option key={meal}>{meal}</option>)}
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
              <Col md={4}>
                <Form.Group controlId="barcode-value">
                  <Form.Label>{t.barcode}</Form.Label>
                  <Form.Control
                    value={barcodeValue}
                    onChange={(event) => setBarcodeValue(event.target.value)}
                    inputMode="numeric"
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
              <Col sm={6} md={2}>
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
                  <Form.Text className="text-secondary">{t.caloriesDescription}</Form.Text>
                </Form.Group>
              </Col>
              <Col sm={6} md={2}>
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
                  <Form.Text className="text-secondary">{t.proteinDescription}</Form.Text>
                </Form.Group>
              </Col>
              <Col sm={6} md={2}>
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
                  <Form.Text className="text-secondary">{t.carbsDescription}</Form.Text>
                </Form.Group>
              </Col>
              <Col sm={6} md={2}>
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
                  <Form.Text className="text-secondary">{t.fatDescription}</Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex flex-wrap justify-content-between gap-3 mt-3">
              <div className="d-flex flex-wrap gap-2">
                <Button variant="outline-secondary" type="button" onClick={() => handleSaveCurrentFood('favorite')} disabled={editingSavedFood !== null || !canSaveCurrentFood || isSavingShortcut}>
                  {t.saveAsFavorite}
                </Button>
                <Button variant="outline-secondary" type="button" onClick={() => handleSaveCurrentFood('template')} disabled={editingSavedFood !== null || !canSaveCurrentFood || isSavingShortcut}>
                  {t.saveAsTemplate}
                </Button>
                <Button variant="outline-secondary" type="button" onClick={() => handleSaveCurrentFood('packaged')} disabled={editingSavedFood !== null || !canSavePackagedFood || isSavingShortcut}>
                  {t.saveAsPackaged}
                </Button>
              </div>
              <div className="d-flex justify-content-end gap-2">
                {editingSavedFood ? <Button type="button" variant="outline-secondary" onClick={resetForm}>{t.cancelSavedFoodEdit}</Button> : null}
                {editingSavedFood ? (
                  <Button type="button" variant="outline-success" onClick={handleUpdateSavedFood} disabled={!canSaveCurrentFood || isSavingShortcut}>
                    {isSavingShortcut ? t.saving : t.updateSavedFood}
                  </Button>
                ) : null}
                {editingMealLogId ? <Button type="button" variant="outline-secondary" onClick={resetForm}>{t.cancelEdit}</Button> : null}
                <Button type="submit" variant="success" disabled={isSaving}>
                  {isSaving ? t.saving : editingMealLogId ? t.updateFoodEntry : t.addFoodEntry}
                </Button>
              </div>
            </div>
            </Form>
          </Card.Body>
        </Card>

        <Row className="g-4">
          {dailyLogQuery.data.items.map((item) => (
            <Col lg={6} key={item.id}>
              <Card className="border-0 shadow-sm h-100 foodie-log-entry-card">
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
    </>
  )
}