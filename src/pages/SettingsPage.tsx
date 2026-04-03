import { Button, Card, Col, Row, Stack } from 'react-bootstrap'
import { LanguageSelect } from '../components/LanguageSelect'
import { useLanguageContext } from '../contexts/LanguageContext'
import { SessionListCard } from '../components/SessionListCard'
import { useLogoutAction } from '../lib/useLogoutAction'

export const SettingsPage = () => {
  const { t } = useLanguageContext()
  const { logout, isPending } = useLogoutAction()

  return (
    <Stack gap={4}>
      <Card className="border-0 shadow-sm foodie-surface">
        <Card.Body className="p-4">
          <p className="small text-uppercase text-muted fw-semibold mb-2">{t.settings}</p>
          <h1 className="h2 text-dark mb-2">{t.accountSettings}</h1>
          <p className="text-secondary mb-0">{t.languageDescription}</p>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <h2 className="h5 text-dark mb-3">{t.language}</h2>
              <LanguageSelect className="form-select mb-3" />
              <h2 className="h5 text-dark mb-3">{t.securityActions}</h2>
              <div className="d-grid gap-2">
                <Button variant="outline-dark" onClick={logout} disabled={isPending}>{t.logout}</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <SessionListCard showSecurityActions />
        </Col>
      </Row>
    </Stack>
  )
}