import { useState } from 'react'
import { Alert, Button, Form, ListGroup, Spinner, Stack } from 'react-bootstrap'
import { useNutritionMacrosMutation, useNutritionSearchQuery } from '../api/foodieApi'
import { useLanguageContext } from '../contexts/LanguageContext'
import { NutritionMacros } from '../types/models'

interface IngredientNutritionLookupProps {
  initialGrams?: number
  onApply: (macros: NutritionMacros) => void
}

export const IngredientNutritionLookup = ({ initialGrams = 100, onApply }: IngredientNutritionLookupProps) => {
  const { t } = useLanguageContext()
  const [query, setQuery] = useState('')
  const [grams, setGrams] = useState(String(initialGrams))
  const [loadingFoodNumber, setLoadingFoodNumber] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const searchQuery = useNutritionSearchQuery(query)
  const macrosMutation = useNutritionMacrosMutation()

  const trimmedQuery = query.trim()
  const showResults = trimmedQuery.length >= 2
  const results = searchQuery.data ?? []

  const handleApply = async (foodNumber: number) => {
    const parsedGrams = Number.parseInt(grams, 10)

    if (!Number.isFinite(parsedGrams) || parsedGrams <= 0) {
      setErrorMessage(t.nutritionLookupGramsLabel)
      return
    }

    setErrorMessage(null)
    setLoadingFoodNumber(foodNumber)

    try {
      const macros = await macrosMutation.mutateAsync({ foodNumber, grams: parsedGrams })
      onApply(macros)
      setQuery('')
    } catch {
      setErrorMessage(t.nutritionLookupNoResults)
    } finally {
      setLoadingFoodNumber(null)
    }
  }

  return (
    <Stack gap={2} className="border rounded p-2 bg-white">
      <div className="small text-secondary fw-semibold">{t.nutritionLookupTitle}</div>
      <Stack direction="horizontal" gap={2}>
        <Form.Control
          type="search"
          value={query}
          placeholder={t.nutritionLookupPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={t.nutritionLookupPlaceholder}
        />
        <Form.Control
          type="number"
          min={1}
          step={1}
          value={grams}
          onChange={(event) => setGrams(event.target.value)}
          style={{ maxWidth: 100 }}
          aria-label={t.nutritionLookupGramsLabel}
          title={t.nutritionLookupGramsLabel}
        />
      </Stack>
      {errorMessage ? <Alert variant="warning" className="py-1 mb-0 small">{errorMessage}</Alert> : null}
      {showResults ? (
        <ListGroup variant="flush" className="border-top">
          {searchQuery.isFetching ? (
            <ListGroup.Item className="d-flex align-items-center gap-2 py-2 small">
              <Spinner size="sm" animation="border" /> {t.nutritionLookupSearching}
            </ListGroup.Item>
          ) : null}
          {!searchQuery.isFetching && results.length === 0 ? (
            <ListGroup.Item className="py-2 small text-secondary">{t.nutritionLookupNoResults}</ListGroup.Item>
          ) : null}
          {results.slice(0, 10).map((result) => (
            <ListGroup.Item key={result.foodNumber} className="d-flex justify-content-between align-items-center py-2">
              <span className="small">{result.name}</span>
              <Button
                size="sm"
                variant="outline-primary"
                type="button"
                disabled={loadingFoodNumber === result.foodNumber}
                onClick={() => void handleApply(result.foodNumber)}
              >
                {loadingFoodNumber === result.foodNumber ? <Spinner size="sm" animation="border" aria-hidden="true" /> : t.nutritionLookupApply}
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : null}
      <div className="text-secondary small">{t.nutritionLookupSource}</div>
    </Stack>
  )
}
