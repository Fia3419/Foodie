import { Alert, Button, Card } from 'react-bootstrap'
import { SavedFoodSummary } from '../types/models'

interface SavedFoodSectionProps {
  title: string
  emptyMessage: string
  items: SavedFoodSummary[]
  getSecondaryText: (savedFood: SavedFoodSummary) => string
  showEditButton?: boolean
  useLabel: string
  editLabel: string
  deleteLabel: string
  onUse: (savedFood: SavedFoodSummary) => void
  onEdit?: (savedFood: SavedFoodSummary) => void
  onDelete: (id: string) => void
  isDeleteDisabled?: boolean
}

const getSavedFoodKey = (savedFood: SavedFoodSummary) => `${savedFood.kind}-${savedFood.id}`

export const SavedFoodSection = ({
  title,
  emptyMessage,
  items,
  getSecondaryText,
  showEditButton = false,
  useLabel,
  editLabel,
  deleteLabel,
  onUse,
  onEdit,
  onDelete,
  isDeleteDisabled,
}: SavedFoodSectionProps) => {
  return (
    <Card className="border-0 bg-light-subtle h-100">
      <Card.Body className="p-3 d-flex flex-column gap-2">
        <h3 className="h6 text-dark mb-1">{title}</h3>
        {items.length ? items.map((savedFood) => (
          <div key={getSavedFoodKey(savedFood)} className="d-flex justify-content-between align-items-center gap-2 rounded border bg-white px-3 py-2">
            <div>
              <div className="fw-semibold text-dark">{savedFood.name}</div>
              <div className="small text-secondary">{getSecondaryText(savedFood)}</div>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-success" size="sm" type="button" onClick={() => onUse(savedFood)}>{useLabel}</Button>
              {showEditButton && onEdit ? (
                <Button variant="outline-secondary" size="sm" type="button" onClick={() => onEdit(savedFood)}>{editLabel}</Button>
              ) : null}
              <Button variant="outline-danger" size="sm" type="button" disabled={isDeleteDisabled} onClick={() => onDelete(savedFood.id)}>{deleteLabel}</Button>
            </div>
          </div>
        )) : <Alert variant="light" className="mb-0">{emptyMessage}</Alert>}
      </Card.Body>
    </Card>
  )
}
