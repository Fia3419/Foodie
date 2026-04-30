import { useEffect, useState, type ChangeEventHandler, type SyntheticEvent } from 'react'
import { Alert, Badge, Button, Card, Col, Form, Row, Stack } from 'react-bootstrap'
import { fetchNutritionMacros, fetchNutritionSearch, useCreateMealLogMutation, useCreateRecipeMutation, useDeleteRecipeMutation, useImportRecipesMutation, useRecipes, useUpdateRecipeMutation } from '../api/foodieApi'
import { NutritionMacros, NutritionSearchResult, RecipeIngredient, RecipeSummary, UpsertRecipeRequest } from '../types/models'
import { useLanguageContext } from '../contexts/LanguageContext'
import { getLocalDateInputValue, getLocalTimeInputValue } from '../lib/dateTime'
import { buildGroceryListItems, buildGroceryListText, readPlannedRecipeIds, writePlannedRecipeIds } from '../lib/groceryPlanner'
import { DEFAULT_DINNER_MEAL, MEAL_OPTIONS } from '../lib/mealOptions'
import { parseNumberInput } from '../lib/numberInput'
import { IngredientNutritionLookup } from '../components/IngredientNutritionLookup'

interface RecipeIngredientFormValue extends Omit<RecipeIngredient, 'amount' | 'calories' | 'protein' | 'carbs' | 'fat'> {
  amount: string
  calories: string
  protein: string
  carbs: string
  fat: string
  clientId: string
}

interface RecipeFormValues extends Omit<UpsertRecipeRequest, 'servings' | 'caloriesPerServing' | 'proteinPerServing' | 'carbsPerServing' | 'fatPerServing' | 'ingredients'> {
  servings: string
  caloriesPerServing: string
  proteinPerServing: string
  carbsPerServing: string
  fatPerServing: string
  ingredients: RecipeIngredientFormValue[]
}

interface RecipeNutritionSummary {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface AutoFillCandidate {
  index: number
  name: string
  grams: number
}

type RecipeIngredientField = 'name' | 'amount' | 'unit' | 'calories' | 'protein' | 'carbs' | 'fat'

const emptyRecipe: UpsertRecipeRequest = {
  name: '',
  servings: 1,
  caloriesPerServing: 0,
  proteinPerServing: 0,
  carbsPerServing: 0,
  fatPerServing: 0,
  tags: [],
  ingredients: [],
  instructions: '',
}

const emptyIngredient: RecipeIngredient = {
  name: '',
  amount: 0,
  unit: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
}

const createIngredientFormValue = (ingredient: RecipeIngredient = emptyIngredient): RecipeIngredientFormValue => ({
  name: ingredient.name,
  amount: String(ingredient.amount),
  unit: ingredient.unit,
  calories: String(ingredient.calories),
  protein: String(ingredient.protein),
  carbs: String(ingredient.carbs),
  fat: String(ingredient.fat),
  clientId: crypto.randomUUID(),
})

const emptyRecipeFormValues: RecipeFormValues = {
  ...emptyRecipe,
  servings: String(emptyRecipe.servings),
  caloriesPerServing: String(emptyRecipe.caloriesPerServing),
  proteinPerServing: String(emptyRecipe.proteinPerServing),
  carbsPerServing: String(emptyRecipe.carbsPerServing),
  fatPerServing: String(emptyRecipe.fatPerServing),
  ingredients: [],
}

const createRecipeFormValues = (recipe: RecipeSummary | null): RecipeFormValues => {
  if (!recipe) {
    return emptyRecipeFormValues
  }

  return {
    name: recipe.name,
    servings: String(recipe.servings),
    caloriesPerServing: String(recipe.caloriesPerServing),
    proteinPerServing: String(recipe.proteinPerServing),
    carbsPerServing: String(recipe.carbsPerServing),
    fatPerServing: String(recipe.fatPerServing),
    tags: recipe.tags,
    ingredients: recipe.ingredients.map(createIngredientFormValue),
    instructions: recipe.instructions,
  }
}

const toUpsertRecipeRequest = (formValues: RecipeFormValues): UpsertRecipeRequest => ({
  ...formValues,
  servings: parseNumberInput(formValues.servings, 1),
  caloriesPerServing: parseNumberInput(formValues.caloriesPerServing),
  proteinPerServing: parseNumberInput(formValues.proteinPerServing),
  carbsPerServing: parseNumberInput(formValues.carbsPerServing),
  fatPerServing: parseNumberInput(formValues.fatPerServing),
  ingredients: formValues.ingredients.map(({ clientId: _clientId, ...ingredient }) => ({
    ...ingredient,
    amount: parseNumberInput(ingredient.amount),
    calories: parseNumberInput(ingredient.calories),
    protein: parseNumberInput(ingredient.protein),
    carbs: parseNumberInput(ingredient.carbs),
    fat: parseNumberInput(ingredient.fat),
  })),
})

const formatIngredientSummary = (ingredient: RecipeIngredient) => {
  const unitPart = ingredient.unit ? ` ${ingredient.unit}` : ''
  return ingredient.name + ' (' + ingredient.amount + unitPart + ', ' + ingredient.calories + ' kcal)'
}

const unitToGrams: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  ml: 1,
  cl: 10,
  dl: 100,
  l: 1000,
  liter: 1000,
  tsk: 5,
  tsp: 5,
  msk: 15,
  tbsp: 15,
  krm: 1,
  nypa: 1,
  pinch: 1,
  skvätt: 5,
  dash: 5,
  klyfta: 4,
  klyftor: 4,
  clove: 4,
  cloves: 4,
  skiva: 20,
  skivor: 20,
  slice: 20,
  slices: 20,
  st: 50,
  stk: 50,
  styck: 50,
  'styck.': 50,
  stycken: 50,
  piece: 50,
  pieces: 50,
  portion: 200,
  portioner: 200,
  cup: 240,
  cups: 240,
  kopp: 240,
  koppar: 240,
  oz: 28,
  lb: 454,
  knippe: 50,
  bunch: 50,
}

const emptyNutritionSummary: RecipeNutritionSummary = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
}

const estimateGrams = (amount: number, unit: string): number => {
  if (amount <= 0) {
    return 0
  }

  const trimmed = unit.trim().toLowerCase()

  if (trimmed === '') {
    return amount
  }

  const factor = unitToGrams[trimmed]
  return factor ? amount * factor : 0
}

const summarizeIngredientNutrition = (ingredients: RecipeIngredient[]): RecipeNutritionSummary =>
  ingredients.reduce(
    (currentValue, ingredient) => ({
      calories: currentValue.calories + ingredient.calories,
      protein: currentValue.protein + ingredient.protein,
      carbs: currentValue.carbs + ingredient.carbs,
      fat: currentValue.fat + ingredient.fat,
    }),
    emptyNutritionSummary,
  )

const summarizeIngredientFormNutrition = (ingredients: RecipeIngredientFormValue[]): RecipeNutritionSummary =>
  ingredients.reduce(
    (currentValue, ingredient) => ({
      calories: currentValue.calories + parseNumberInput(ingredient.calories),
      protein: currentValue.protein + parseNumberInput(ingredient.protein),
      carbs: currentValue.carbs + parseNumberInput(ingredient.carbs),
      fat: currentValue.fat + parseNumberInput(ingredient.fat),
    }),
    emptyNutritionSummary,
  )

const calculatePerServingNutrition = (totals: RecipeNutritionSummary, servings: number): RecipeNutritionSummary => {
  const boundedServings = Math.max(servings, 1)

  return {
    calories: Math.round(totals.calories / boundedServings),
    protein: Math.round(totals.protein / boundedServings),
    carbs: Math.round(totals.carbs / boundedServings),
    fat: Math.round(totals.fat / boundedServings),
  }
}

const applyIngredientNutritionToRecipeForm = (formValues: RecipeFormValues): RecipeFormValues => {
  const totals = summarizeIngredientFormNutrition(formValues.ingredients)
  const perServing = calculatePerServingNutrition(totals, parseNumberInput(formValues.servings, 1))

  return {
    ...formValues,
    caloriesPerServing: String(perServing.calories),
    proteinPerServing: String(perServing.protein),
    carbsPerServing: String(perServing.carbs),
    fatPerServing: String(perServing.fat),
  }
}

const summarizeRecipeNutrition = (recipe: RecipeSummary): RecipeNutritionSummary => {
  const ingredientTotals = summarizeIngredientNutrition(recipe.ingredients)
  const perServing = calculatePerServingNutrition(ingredientTotals, recipe.servings)

  const pickValue = (storedValue: number, ingredientTotal: number, computedValue: number) => {
    if (ingredientTotal > 0) {
      return computedValue
    }
    return storedValue
  }

  return {
    calories: pickValue(recipe.caloriesPerServing, ingredientTotals.calories, perServing.calories),
    protein: pickValue(recipe.proteinPerServing, ingredientTotals.protein, perServing.protein),
    carbs: pickValue(recipe.carbsPerServing, ingredientTotals.carbs, perServing.carbs),
    fat: pickValue(recipe.fatPerServing, ingredientTotals.fat, perServing.fat),
  }
}

const buildRecipeLogFoodName = (recipeName: string, servingsToLog: number, servingsLabel: string) => {
  if (servingsToLog === 1) {
    return recipeName
  }

  return recipeName + ' (' + servingsToLog + ' ' + servingsLabel.toLowerCase() + ')'
}

export const RecipesPage = () => {
  const { t } = useLanguageContext()
  const recipesQuery = useRecipes()
  const createRecipeMutation = useCreateRecipeMutation()
  const createMealLogMutation = useCreateMealLogMutation()
  const deleteRecipeMutation = useDeleteRecipeMutation()
  const updateRecipeMutation = useUpdateRecipeMutation()
  const importRecipesMutation = useImportRecipesMutation()
  const [editingRecipe, setEditingRecipe] = useState<RecipeSummary | null>(null)
  const [formValues, setFormValues] = useState<RecipeFormValues>(emptyRecipeFormValues)
  const [recipeToLogId, setRecipeToLogId] = useState('')
  const [recipeLogMealName, setRecipeLogMealName] = useState<string>(DEFAULT_DINNER_MEAL)
  const [recipeLogServings, setRecipeLogServings] = useState('1')
  const [recipeLogDate, setRecipeLogDate] = useState(getLocalDateInputValue())
  const [recipeLogTime, setRecipeLogTime] = useState(getLocalTimeInputValue())
  const [plannedRecipeIds, setPlannedRecipeIds] = useState<string[]>(() => readPlannedRecipeIds())
  const [importQuery, setImportQuery] = useState('')
  const [importCount, setImportCount] = useState('5')
  const [importTranslate, setImportTranslate] = useState(true)
  const [importMessage, setImportMessage] = useState<{ variant: 'success' | 'warning' | 'danger' | 'info'; text: string } | null>(null)
  const [autoFillRunning, setAutoFillRunning] = useState(false)
  const [autoFillMessage, setAutoFillMessage] = useState<{ variant: 'success' | 'warning' | 'danger' | 'info'; text: string } | null>(null)

  useEffect(() => {
    writePlannedRecipeIds(plannedRecipeIds)
  }, [plannedRecipeIds])

  useEffect(() => {
    if (!recipesQuery.data) {
      return
    }

    const availableRecipeIds = new Set(recipesQuery.data.map((recipe) => recipe.id))
    setPlannedRecipeIds((currentValue) => {
      const nextValue = currentValue.filter((recipeId) => availableRecipeIds.has(recipeId))
      return nextValue.length === currentValue.length ? currentValue : nextValue
    })
  }, [recipesQuery.data])

  const applyRecipe = (recipe: RecipeSummary | null) => {
    setEditingRecipe(recipe)
    setFormValues(createRecipeFormValues(recipe))
  }

  const updateIngredientField = (index: number, field: RecipeIngredientField, value: string) => {
    const ingredient = formValues.ingredients[index]

    if (!ingredient) {
      return
    }

    updateIngredient(index, { ...ingredient, [field]: value })
  }

  const createIngredientChangeHandler = (index: number, field: RecipeIngredientField): ChangeEventHandler<HTMLInputElement> =>
    (event) => {
      updateIngredientField(index, field, event.target.value)
    }

  const removeIngredient = (index: number) => {
    setFormValues((current) => ({
      ...current,
      ingredients: current.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index),
    }))
  }

  const addIngredient = () => {
    setFormValues((current) => ({
      ...current,
      ingredients: [...current.ingredients, createIngredientFormValue()],
    }))
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    const request = toUpsertRecipeRequest(formValues)

    if (editingRecipe) {
      updateRecipeMutation.mutate(
        { id: editingRecipe.id, request },
        {
          onSuccess: () => applyRecipe(null),
        },
      )
      return
    }

    createRecipeMutation.mutate(request, {
      onSuccess: () => applyRecipe(null),
    })
  }

  const updateIngredient = (index: number, nextIngredient: RecipeIngredientFormValue) => {
    setFormValues((currentValue) => ({
      ...currentValue,
      ingredients: currentValue.ingredients.map((ingredient, ingredientIndex) => {
        if (ingredientIndex === index) {
          return nextIngredient
        }

        return ingredient
      }),
    }))
  }

  const applyNutritionLookupToIngredient = (
    index: number,
    macros: { name: string; grams: number; calories: number; protein: number; carbs: number; fat: number },
  ) => {
    const ingredient = formValues.ingredients[index]

    if (!ingredient) {
      return
    }

    updateIngredient(index, {
      ...ingredient,
      name: ingredient.name.trim() ? ingredient.name : macros.name,
      amount: String(macros.grams),
      unit: ingredient.unit.trim() ? ingredient.unit : 'g',
      calories: String(macros.calories),
      protein: String(macros.protein),
      carbs: String(macros.carbs),
      fat: String(macros.fat),
    })
  }

  const autoFillIngredientMacros = async () => {
    setAutoFillRunning(true)
    setAutoFillMessage(null)

    let skippedCount = 0
    const candidates: AutoFillCandidate[] = []

    for (let index = 0; index < formValues.ingredients.length; index += 1) {
      const ingredient = formValues.ingredients[index]
      const trimmedName = ingredient.name.trim()

      if (!trimmedName) {
        skippedCount += 1
        continue
      }

      const amount = parseNumberInput(ingredient.amount)
      const grams = Math.round(estimateGrams(amount, ingredient.unit))

      if (grams <= 0) {
        skippedCount += 1
        continue
      }

      candidates.push({ index, name: trimmedName, grams })
    }

    const searchCache = new Map<string, Promise<NutritionSearchResult | undefined>>()
    const macrosCache = new Map<string, Promise<NutritionMacros>>()

    const readFirstSearchResult = (name: string) => {
      const cacheKey = name.toLowerCase()
      const cached = searchCache.get(cacheKey)

      if (cached) {
        return cached
      }

      const request = fetchNutritionSearch(name).then((results) => results[0])
      searchCache.set(cacheKey, request)
      return request
    }

    const readMacros = (foodNumber: number, grams: number) => {
      const cacheKey = `${foodNumber}:${grams}`
      const cached = macrosCache.get(cacheKey)

      if (cached) {
        return cached
      }

      const request = fetchNutritionMacros(foodNumber, grams)
      macrosCache.set(cacheKey, request)
      return request
    }

    try {
      const concurrency = 5
      const results: { candidate: AutoFillCandidate; macros: NutritionMacros | null }[] = new Array(candidates.length)
      let nextIndex = 0

      const worker = async () => {
        while (true) {
          const index = nextIndex++
          if (index >= candidates.length) {
            return
          }
          const candidate = candidates[index]
          try {
            const firstMatch = await readFirstSearchResult(candidate.name)
            if (!firstMatch) {
              results[index] = { candidate, macros: null }
              continue
            }
            results[index] = {
              candidate,
              macros: await readMacros(firstMatch.foodNumber, candidate.grams),
            }
          } catch {
            results[index] = { candidate, macros: null }
          }
        }
      }

      await Promise.all(
        Array.from({ length: Math.min(concurrency, candidates.length) }, () => worker()),
      )
      const successfulResults = results.filter((result): result is { candidate: AutoFillCandidate; macros: NutritionMacros } => result.macros !== null)
      const failedNames = results
        .filter((result) => result.macros === null)
        .map((result) => result.candidate.name)
      const updatedCount = successfulResults.length

      if (updatedCount > 0) {
        setFormValues((current) => {
          const next = [...current.ingredients]

          successfulResults.forEach(({ candidate, macros }) => {
            const existing = next[candidate.index]

            if (!existing) {
              return
            }

            next[candidate.index] = {
              ...existing,
              calories: String(macros.calories),
              protein: String(macros.protein),
              carbs: String(macros.carbs),
              fat: String(macros.fat),
            }
          })

          return applyIngredientNutritionToRecipeForm({ ...current, ingredients: next })
        })
      }

      const parts: string[] = []
      parts.push(`${updatedCount} ${t.autoFillUpdated}`)
      if (skippedCount > 0) {
        parts.push(`${skippedCount} ${t.autoFillSkipped}`)
      }
      if (failedNames.length > 0) {
        parts.push(`${t.autoFillFailed}: ${failedNames.join(', ')}`)
      }

      setAutoFillMessage({
        variant: failedNames.length > 0 ? 'warning' : updatedCount > 0 ? 'success' : 'info',
        text: parts.join(' · '),
      })
    } finally {
      setAutoFillRunning(false)
    }
  }

  const togglePlannedRecipe = (recipeId: string) => {
    setPlannedRecipeIds((currentValue) => {
      if (currentValue.includes(recipeId)) {
        return currentValue.filter((currentId) => currentId !== recipeId)
      }

      return [...currentValue, recipeId]
    })
  }

  const handleSelectRecipeForLogging = (recipe: RecipeSummary) => {
    setRecipeToLogId(recipe.id)
    setRecipeLogServings('1')
    setRecipeLogMealName(DEFAULT_DINNER_MEAL)
  }

  const handleImportRecipes = async () => {
    const trimmed = importQuery.trim()

    if (!trimmed) {
      setImportMessage({ variant: 'warning', text: t.importRecipesQueryRequired })
      return
    }

    setImportMessage({ variant: 'info', text: t.importRecipesInProgress })
    const count = Math.max(1, Math.min(20, parseNumberInput(importCount, 5)))

    try {
      const imported = await importRecipesMutation.mutateAsync({
        query: trimmed,
        count,
        translateToSwedish: importTranslate,
      })

      if (imported.length === 0) {
        setImportMessage({ variant: 'warning', text: t.importRecipesNoResults })
        return
      }

      setImportMessage({ variant: 'success', text: t.importRecipesSuccess(imported.length) })
      setImportQuery('')
    } catch (error: unknown) {
      console.error('Recipe import failed', error)
      const status = (error as { response?: { status?: number; data?: { message?: string } } }).response?.status
      const serverMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message
      const fallback = (error as { message?: string }).message ?? t.importRecipesNoResults
      let text: string

      if (status === 503) {
        text = t.importRecipesNotConfigured
      } else if (serverMessage) {
        text = serverMessage
      } else {
        text = fallback
      }

      setImportMessage({ variant: 'danger', text })
    }
  }

  const handleLogRecipe = async () => {
    const recipe = recipesQuery.data?.find((currentValue) => currentValue.id === recipeToLogId)

    if (!recipe) {
      return
    }

    const servingsToLog = Math.max(parseNumberInput(recipeLogServings, 1), 1)
    const nutrition = summarizeRecipeNutrition(recipe)
    const foodName = buildRecipeLogFoodName(recipe.name, servingsToLog, t.servings)

    await createMealLogMutation.mutateAsync({
      mealName: recipeLogMealName,
      foodName,
      calories: Math.round(nutrition.calories * servingsToLog),
      protein: Math.round(nutrition.protein * servingsToLog),
      carbs: Math.round(nutrition.carbs * servingsToLog),
      fat: Math.round(nutrition.fat * servingsToLog),
      logDate: recipeLogDate,
      loggedAt: recipeLogTime,
    })
  }

  const isSaving = createRecipeMutation.isPending || updateRecipeMutation.isPending
  let submitLabel = t.saveRecipe

  if (isSaving) {
    submitLabel = t.saving
  } else if (editingRecipe) {
    submitLabel = t.updateRecipe
  }

  if (recipesQuery.isLoading) {
    return <Alert variant="light">{t.recipesLoading}</Alert>
  }

  if (!recipesQuery.data) {
    return <Alert variant="danger">{t.recipesUnavailable}</Alert>
  }

  const recipeToLog = recipesQuery.data.find((recipe) => recipe.id === recipeToLogId) ?? null
  const plannedRecipes = recipesQuery.data.filter((recipe) => plannedRecipeIds.includes(recipe.id))
  const groceryListItems = buildGroceryListItems(plannedRecipes)
  const groceryListText = buildGroceryListText(groceryListItems)
  const formNutritionTotals = summarizeIngredientFormNutrition(formValues.ingredients)
  const formNutritionPerServing = calculatePerServingNutrition(formNutritionTotals, parseNumberInput(formValues.servings, 1))

  return (
    <Stack gap={4}>
      <Card className="border-0 shadow-sm foodie-surface">
        <Card.Body className="p-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div>
            <p className="small text-uppercase text-muted fw-semibold mb-2">{t.recipes}</p>
            <h1 className="h2 text-dark mb-2">{t.recipesTitle}</h1>
            <p className="text-secondary mb-0">{t.recipesDescription}</p>
          </div>
          <Button variant="outline-success" onClick={() => applyRecipe(null)}>{t.createRecipe}</Button>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4 d-flex flex-column gap-3">
          <div>
            <h2 className="h5 text-dark mb-1">{t.importRecipesTitle}</h2>
            <p className="text-secondary small mb-0">{t.importRecipesDescription}</p>
          </div>
          <Row className="g-2 align-items-end">
            <Col md={6}>
              <Form.Group controlId="import-query">
                <Form.Label className="small mb-1">{t.importRecipesPlaceholder}</Form.Label>
                <Form.Control
                  type="search"
                  value={importQuery}
                  placeholder={t.importRecipesPlaceholder}
                  onChange={(event) => setImportQuery(event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group controlId="import-count">
                <Form.Label className="small mb-1">{t.servings}</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={20}
                  value={importCount}
                  onChange={(event) => setImportCount(event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Check
                type="switch"
                id="import-translate"
                label={t.translateToSwedish}
                checked={importTranslate}
                onChange={(event) => setImportTranslate(event.target.checked)}
              />
            </Col>
            <Col xs={12} md={2}>
              <Button
                type="button"
                variant="success"
                className="w-100"
                disabled={importRecipesMutation.isPending}
                onClick={() => void handleImportRecipes()}
              >
                {importRecipesMutation.isPending ? t.saving : t.importRecipesAction}
              </Button>
            </Col>
          </Row>
          {importMessage ? (
            <Alert variant={importMessage.variant} className="mb-0 py-2 small">{importMessage.text}</Alert>
          ) : null}
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col xl={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4 d-flex flex-column gap-3">
              <div>
                <h2 className="h4 text-dark mb-2">{t.recipeLogTitle}</h2>
                <p className="text-secondary mb-0">{t.recipeLogDescription}</p>
              </div>
              <Form.Group controlId="recipe-to-log">
                <Form.Label>{t.recipeName}</Form.Label>
                <Form.Select value={recipeToLogId} onChange={(event) => setRecipeToLogId(event.target.value)} aria-label={t.recipeName} title={t.recipeName}>
                  <option value="">{t.logRecipe}</option>
                  {recipesQuery.data.map((recipe) => (
                    <option value={recipe.id} key={recipe.id}>{recipe.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group controlId="recipe-log-meal-name">
                    <Form.Label>{t.meal}</Form.Label>
                    <Form.Select value={recipeLogMealName} onChange={(event) => setRecipeLogMealName(event.target.value)} aria-label={t.meal} title={t.meal}>
                      {MEAL_OPTIONS.map((meal) => <option key={meal}>{meal}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="recipe-log-servings">
                    <Form.Label>{t.servingsToLog}</Form.Label>
                    <Form.Control type="number" min={1} step="0.5" value={recipeLogServings} onChange={(event) => setRecipeLogServings(event.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="recipe-log-date">
                    <Form.Label>{t.date}</Form.Label>
                    <Form.Control type="date" value={recipeLogDate} onChange={(event) => setRecipeLogDate(event.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="recipe-log-time">
                    <Form.Label>{t.time}</Form.Label>
                    <Form.Control type="time" value={recipeLogTime} onChange={(event) => setRecipeLogTime(event.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
              {recipeToLog ? (
                <Alert variant="light" className="mb-0">
                  {(() => {
                    const nutrition = summarizeRecipeNutrition(recipeToLog)
                    const servingsToLog = Math.max(parseNumberInput(recipeLogServings, 1), 1)
                    return `${Math.round(nutrition.calories * servingsToLog)} kcal · P ${Math.round(nutrition.protein * servingsToLog)} · C ${Math.round(nutrition.carbs * servingsToLog)} · F ${Math.round(nutrition.fat * servingsToLog)}`
                  })()}
                </Alert>
              ) : null}
              <Button variant="success" onClick={() => void handleLogRecipe()} disabled={!recipeToLog || createMealLogMutation.isPending}>
                {t.logRecipe}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4 d-flex flex-column gap-3">
              <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                <div>
                  <h2 className="h4 text-dark mb-2">{t.groceryList}</h2>
                  <p className="text-secondary mb-0">{t.groceryListDescription}</p>
                </div>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <Badge bg="light" text="dark">{t.plannedRecipes}: {plannedRecipes.length}</Badge>
                  <Button variant="outline-secondary" onClick={() => void navigator.clipboard.writeText(groceryListText)} disabled={!groceryListItems.length}>
                    {t.copyGroceryList}
                  </Button>
                </div>
              </div>
              {groceryListItems.length ? (
                <Stack gap={2}>
                  {groceryListItems.map((item) => (
                    <div key={item.key} className="d-flex justify-content-between align-items-center rounded border bg-light-subtle px-3 py-2">
                      <span className="fw-semibold text-dark">{item.name}</span>
                      <span className="text-secondary">{Number.isInteger(item.amount) ? item.amount : item.amount.toFixed(1)} {item.unit}</span>
                    </div>
                  ))}
                </Stack>
              ) : (
                <Alert variant="light" className="mb-0">{t.noGroceriesSelected}</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="recipe-name">
                  <Form.Label>{t.recipeName}</Form.Label>
                  <Form.Control value={formValues.name} onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))} required />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="recipe-servings">
                  <Form.Label>{t.servings}</Form.Label>
                  <Form.Control type="number" min={1} inputMode="numeric" value={formValues.servings} onChange={(event) => setFormValues((current) => ({ ...current, servings: event.target.value }))} required />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="recipe-calories">
                  <Form.Label>{t.caloriesPerServing}</Form.Label>
                  <Form.Control type="number" min={0} inputMode="numeric" value={formValues.caloriesPerServing} onChange={(event) => setFormValues((current) => ({ ...current, caloriesPerServing: event.target.value }))} required />
                  <Form.Text className="text-secondary">{t.caloriesPerServingDescription}</Form.Text>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="recipe-protein">
                  <Form.Label>{t.proteinPerServing}</Form.Label>
                  <Form.Control type="number" min={0} inputMode="numeric" value={formValues.proteinPerServing} onChange={(event) => setFormValues((current) => ({ ...current, proteinPerServing: event.target.value }))} required />
                  <Form.Text className="text-secondary">{t.proteinPerServingDescription}</Form.Text>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="recipe-carbs">
                  <Form.Label>{t.carbsPerServing}</Form.Label>
                  <Form.Control type="number" min={0} inputMode="numeric" value={formValues.carbsPerServing} onChange={(event) => setFormValues((current) => ({ ...current, carbsPerServing: event.target.value }))} />
                  <Form.Text className="text-secondary">{t.carbsPerServingDescription}</Form.Text>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="recipe-fat">
                  <Form.Label>{t.fatPerServing}</Form.Label>
                  <Form.Control type="number" min={0} inputMode="numeric" value={formValues.fatPerServing} onChange={(event) => setFormValues((current) => ({ ...current, fatPerServing: event.target.value }))} />
                  <Form.Text className="text-secondary">{t.fatPerServingDescription}</Form.Text>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group controlId="recipe-tags">
                  <Form.Label>{t.tags}</Form.Label>
                  <Form.Control value={formValues.tags.join(', ')} placeholder={t.tagPlaceholder} onChange={(event) => setFormValues((current) => ({ ...current, tags: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) }))} />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Label className="mb-1">{t.ingredientNutrition}</Form.Label>
                <Form.Text className="d-block text-secondary mb-2">{t.ingredientNutritionDescription}</Form.Text>
                {formValues.ingredients.length > 0 ? (
                  <Card className="border-0 bg-success-subtle mb-3">
                    <Card.Body className="p-3">
                      <div className="d-flex flex-column flex-md-row justify-content-between gap-2 align-items-md-center">
                        <div>
                          <h3 className="h6 mb-1">{t.computedMacrosTitle}</h3>
                          <p className="text-secondary small mb-2">{t.computedMacrosDescription}</p>
                          <div className="small">
                            <div>
                              <strong>{t.computedMacrosTotal}:</strong> {Math.round(formNutritionTotals.calories)} kcal · P {Math.round(formNutritionTotals.protein)}g · C {Math.round(formNutritionTotals.carbs)}g · F {Math.round(formNutritionTotals.fat)}g
                            </div>
                            <div>
                              <strong>{t.computedMacrosPerServing}:</strong> {formNutritionPerServing.calories} kcal · P {formNutritionPerServing.protein}g · C {formNutritionPerServing.carbs}g · F {formNutritionPerServing.fat}g
                            </div>
                          </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row gap-2 align-items-md-end">
                          <Button
                            type="button"
                            variant="outline-primary"
                            size="sm"
                            disabled={autoFillRunning || formValues.ingredients.length === 0}
                            onClick={() => void autoFillIngredientMacros()}
                          >
                            {autoFillRunning ? t.autoFillRunning : t.autoFillButton}
                          </Button>
                          <Button
                            type="button"
                            variant="outline-success"
                            size="sm"
                            onClick={() => setFormValues((current) => applyIngredientNutritionToRecipeForm(current))}
                          >
                            {t.computedMacrosApply}
                          </Button>
                        </div>
                      </div>
                      {autoFillMessage ? (
                        <Alert variant={autoFillMessage.variant} className="mt-2 mb-0 py-2 small">
                          {autoFillMessage.text}
                        </Alert>
                      ) : null}
                    </Card.Body>
                  </Card>
                ) : null}
                <Stack gap={3}>
                  {formValues.ingredients.map((ingredient, index) => (
                    <Card key={ingredient.clientId} className="border-0 bg-light-subtle">
                      <Card.Body className="p-3">
                        <Row className="g-2 align-items-end">
                          <Col md={5}>
                            <Form.Group controlId={`ingredient-${ingredient.clientId}-name`}>
                              <Form.Label className="small mb-1">{t.ingredientName}</Form.Label>
                              <Form.Control value={ingredient.name} placeholder={t.ingredientsPlaceholder} onChange={createIngredientChangeHandler(index, 'name')} />
                            </Form.Group>
                          </Col>
                          <Col xs={6} md={2}>
                            <Form.Group controlId={`ingredient-${ingredient.clientId}-amount`}>
                              <Form.Label className="small mb-1">{t.ingredientAmount}</Form.Label>
                              <Form.Control type="number" min={0} step="0.1" inputMode="decimal" value={ingredient.amount} onChange={createIngredientChangeHandler(index, 'amount')} />
                            </Form.Group>
                          </Col>
                          <Col xs={6} md={3}>
                            <Form.Group controlId={`ingredient-${ingredient.clientId}-unit`}>
                              <Form.Label className="small mb-1">{t.ingredientUnit}</Form.Label>
                              <Form.Control value={ingredient.unit} placeholder="g" onChange={createIngredientChangeHandler(index, 'unit')} />
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Button variant="outline-danger" className="w-100" type="button" onClick={() => removeIngredient(index)}>
                              {t.removeIngredient}
                            </Button>
                          </Col>
                          <Col xs={6} md={3}>
                            <Form.Group controlId={`ingredient-${ingredient.clientId}-calories`}>
                              <Form.Label className="small mb-1">{t.calories}</Form.Label>
                              <Form.Control type="number" min={0} inputMode="numeric" value={ingredient.calories} title={t.caloriesDescription} onChange={createIngredientChangeHandler(index, 'calories')} />
                            </Form.Group>
                          </Col>
                          <Col xs={6} md={3}>
                            <Form.Group controlId={`ingredient-${ingredient.clientId}-protein`}>
                              <Form.Label className="small mb-1">{t.protein}</Form.Label>
                              <Form.Control type="number" min={0} inputMode="numeric" value={ingredient.protein} title={t.proteinDescription} onChange={createIngredientChangeHandler(index, 'protein')} />
                            </Form.Group>
                          </Col>
                          <Col xs={6} md={3}>
                            <Form.Group controlId={`ingredient-${ingredient.clientId}-carbs`}>
                              <Form.Label className="small mb-1">{t.carbs}</Form.Label>
                              <Form.Control type="number" min={0} inputMode="numeric" value={ingredient.carbs} title={t.carbsDescription} onChange={createIngredientChangeHandler(index, 'carbs')} />
                            </Form.Group>
                          </Col>
                          <Col xs={6} md={3}>
                            <Form.Group controlId={`ingredient-${ingredient.clientId}-fat`}>
                              <Form.Label className="small mb-1">{t.fat}</Form.Label>
                              <Form.Control type="number" min={0} inputMode="numeric" value={ingredient.fat} title={t.fatDescription} onChange={createIngredientChangeHandler(index, 'fat')} />
                            </Form.Group>
                          </Col>
                          <Col xs={12}>
                            <IngredientNutritionLookup
                              initialGrams={parseNumberInput(ingredient.amount, 100) || 100}
                              onApply={(macros) => applyNutritionLookupToIngredient(index, macros)}
                            />
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                  <Button variant="outline-secondary" type="button" onClick={addIngredient}>
                    {t.ingredients}
                  </Button>
                </Stack>
              </Col>
              <Col md={6}>
                <Form.Group controlId="recipe-instructions">
                  <Form.Label>{t.instructions}</Form.Label>
                  <Form.Control as="textarea" rows={5} value={formValues.instructions} placeholder={t.instructionsPlaceholder} onChange={(event) => setFormValues((current) => ({ ...current, instructions: event.target.value }))} />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              {editingRecipe ? <Button variant="outline-secondary" type="button" onClick={() => applyRecipe(null)}>{t.createRecipe}</Button> : null}
              {editingRecipe ? <Button variant="outline-danger" type="button" onClick={() => deleteRecipeMutation.mutate(editingRecipe.id, { onSuccess: () => applyRecipe(null) })}>{t.deleteRecipe}</Button> : null}
              <Button type="submit" variant="success" disabled={isSaving}>{submitLabel}</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {recipesQuery.data.map((recipe) => (
          <Col md={6} xl={4} key={recipe.id}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4 d-flex flex-column gap-3">
                <div>
                  <h2 className="h5 text-dark mb-2">{recipe.name}</h2>
                  <p className="text-secondary mb-0">
                    {(() => {
                      const nutrition = summarizeRecipeNutrition(recipe)
                      return `${nutrition.calories} kcal · P ${nutrition.protein}g · C ${nutrition.carbs}g · F ${nutrition.fat}g`
                    })()}
                  </p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <Badge bg={recipe.isOwnedByCurrentUser ? 'success' : 'light'} text={recipe.isOwnedByCurrentUser ? undefined : 'dark'}>
                    {recipe.isOwnedByCurrentUser ? t.ownRecipe : t.libraryRecipe}
                  </Badge>
                  {recipe.tags.map((tag) => (
                    <Badge bg="light" text="dark" key={tag}>
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="text-secondary small">
                  <strong>{t.ingredients}:</strong> {recipe.ingredients.map(formatIngredientSummary).join(', ')}
                </div>
                <div className="text-secondary small white-space-pre-line">{recipe.instructions}</div>
                <div className="mt-auto text-secondary small">{recipe.servings} servings</div>
                <div className="d-flex flex-wrap gap-2">
                  <Button variant="outline-success" size="sm" onClick={() => handleSelectRecipeForLogging(recipe)}>{t.logRecipe}</Button>
                  <Button variant={plannedRecipeIds.includes(recipe.id) ? 'success' : 'outline-secondary'} size="sm" onClick={() => togglePlannedRecipe(recipe.id)}>
                    {plannedRecipeIds.includes(recipe.id) ? t.removeFromGroceryList : t.addToGroceryList}
                  </Button>
                  {recipe.isOwnedByCurrentUser ? <Button variant="outline-success" size="sm" onClick={() => applyRecipe(recipe)}>{t.editRecipe}</Button> : null}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Stack>
  )
}