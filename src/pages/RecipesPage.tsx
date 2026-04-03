import { useState, type ChangeEventHandler, type ComponentProps } from 'react'
import { Alert, Badge, Button, Card, Col, Form, Row, Stack } from 'react-bootstrap'
import { useCreateRecipeMutation, useDeleteRecipeMutation, useRecipes, useUpdateRecipeMutation } from '../api/foodieApi'
import { useLanguageContext } from '../contexts/LanguageContext'
import { parseNumberInput } from '../lib/numberInput'
import { RecipeIngredient, RecipeSummary, UpsertRecipeRequest } from '../types/models'

interface RecipeIngredientFormValue extends Omit<RecipeIngredient, 'amount' | 'calories' | 'protein' | 'carbs' | 'fat'> {
  amount: string
  calories: string
  protein: string
  carbs: string
  fat: string
  clientId: string
}

interface RecipeFormValues extends Omit<UpsertRecipeRequest, 'servings' | 'caloriesPerServing' | 'proteinPerServing' | 'ingredients'> {
  servings: string
  caloriesPerServing: string
  proteinPerServing: string
  ingredients: RecipeIngredientFormValue[]
}

type RecipeIngredientField = 'name' | 'amount' | 'unit' | 'calories' | 'protein' | 'carbs' | 'fat'
type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0]

const emptyRecipe: UpsertRecipeRequest = {
  name: '',
  servings: 1,
  caloriesPerServing: 0,
  proteinPerServing: 0,
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

export const RecipesPage = () => {
  const { t } = useLanguageContext()
  const recipesQuery = useRecipes()
  const createRecipeMutation = useCreateRecipeMutation()
  const deleteRecipeMutation = useDeleteRecipeMutation()
  const updateRecipeMutation = useUpdateRecipeMutation()
  const [editingRecipe, setEditingRecipe] = useState<RecipeSummary | null>(null)
  const [formValues, setFormValues] = useState<RecipeFormValues>(emptyRecipeFormValues)

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

  const handleSubmit = (event: FormSubmitEvent) => {
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

  const isSaving = createRecipeMutation.isPending || updateRecipeMutation.isPending
  const submitLabel = (() => {
    if (isSaving) {
      return t.saving
    }

    if (editingRecipe) {
      return t.updateRecipe
    }

    return t.saveRecipe
  })()

  if (recipesQuery.isLoading) {
    return <Alert variant="light">{t.recipesLoading}</Alert>
  }

  if (!recipesQuery.data) {
    return <Alert variant="danger">{t.recipesUnavailable}</Alert>
  }

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
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="recipe-protein">
                  <Form.Label>{t.proteinPerServing}</Form.Label>
                  <Form.Control type="number" min={0} inputMode="numeric" value={formValues.proteinPerServing} onChange={(event) => setFormValues((current) => ({ ...current, proteinPerServing: event.target.value }))} required />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group controlId="recipe-tags">
                  <Form.Label>{t.tags}</Form.Label>
                  <Form.Control value={formValues.tags.join(', ')} placeholder={t.tagPlaceholder} onChange={(event) => setFormValues((current) => ({ ...current, tags: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) }))} />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Label>{t.ingredientNutrition}</Form.Label>
                <Stack gap={3}>
                  {formValues.ingredients.map((ingredient, index) => (
                    <Card key={ingredient.clientId} className="border-0 bg-light-subtle">
                      <Card.Body className="p-3">
                        <Row className="g-2">
                          <Col md={4}>
                            <Form.Control value={ingredient.name} placeholder={t.ingredients} onChange={createIngredientChangeHandler(index, 'name')} />
                          </Col>
                          <Col md={2}>
                            <Form.Control type="number" min={0} step="0.1" inputMode="decimal" value={ingredient.amount} onChange={createIngredientChangeHandler(index, 'amount')} />
                          </Col>
                          <Col md={2}>
                            <Form.Control value={ingredient.unit} placeholder="g" onChange={createIngredientChangeHandler(index, 'unit')} />
                          </Col>
                          <Col md={2}>
                            <Form.Control type="number" min={0} inputMode="numeric" value={ingredient.calories} placeholder={t.calories} onChange={createIngredientChangeHandler(index, 'calories')} />
                          </Col>
                          <Col md={2}>
                            <Button variant="outline-danger" className="w-100" type="button" onClick={() => removeIngredient(index)}>
                              {t.removeIngredient}
                            </Button>
                          </Col>
                          <Col md={4}>
                            <Form.Control type="number" min={0} inputMode="numeric" value={ingredient.protein} placeholder={t.protein} onChange={createIngredientChangeHandler(index, 'protein')} />
                          </Col>
                          <Col md={4}>
                            <Form.Control type="number" min={0} inputMode="numeric" value={ingredient.carbs} placeholder={t.carbs} onChange={createIngredientChangeHandler(index, 'carbs')} />
                          </Col>
                          <Col md={4}>
                            <Form.Control type="number" min={0} inputMode="numeric" value={ingredient.fat} placeholder={t.fat} onChange={createIngredientChangeHandler(index, 'fat')} />
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
                    {recipe.caloriesPerServing} kcal per serving, {recipe.proteinPerServing}g protein
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
                {recipe.isOwnedByCurrentUser ? <Button variant="outline-success" size="sm" onClick={() => applyRecipe(recipe)}>{t.editRecipe}</Button> : null}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Stack>
  )
}