import { Alert, Badge, Button, Card, ListGroup, Stack } from 'react-bootstrap'
import { useRevokeOtherSessionsMutation, useRevokeSessionMutation, useSessionsQuery } from '../api/foodieApi'
import { useLanguageContext } from '../contexts/LanguageContext'
import { useSessionContext } from '../contexts/SessionContext'

interface SessionListCardProps {
  showSecurityActions?: boolean
}

export const SessionListCard = ({ showSecurityActions = false }: SessionListCardProps) => {
  const { t } = useLanguageContext()
  const { authSession, clearAuthSession } = useSessionContext()
  const sessionsQuery = useSessionsQuery()
  const revokeSessionMutation = useRevokeSessionMutation()
  const revokeOtherSessionsMutation = useRevokeOtherSessionsMutation()

  if (sessionsQuery.isLoading) {
    return <Card className="border-0 shadow-sm"><Card.Body>{t.sessions}...</Card.Body></Card>
  }

  if (!sessionsQuery.data) {
    return <Alert variant="warning">{t.sessions}</Alert>
  }

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body className="p-4">
        <h2 className="h5 text-dark mb-3">{t.sessions}</h2>
        {showSecurityActions ? (
          <div className="d-flex justify-content-end mb-3">
            <Button variant="outline-danger" size="sm" onClick={() => revokeOtherSessionsMutation.mutate()}>
              {t.revokeOtherSessions}
            </Button>
          </div>
        ) : null}
        <ListGroup variant="flush">
          {sessionsQuery.data.map((session) => {
            const isCurrent = session.sessionId === authSession?.sessionId

            return (
              <ListGroup.Item key={session.sessionId} className="px-0 bg-transparent">
                <Stack gap={2}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="fw-semibold text-dark">{session.deviceName}</div>
                      <div className="small text-secondary">{t.lastUsed}: {new Date(session.lastUsedAtUtc).toLocaleString()}</div>
                      <div className="small text-secondary">{t.activeUntil}: {new Date(session.expiresAtUtc).toLocaleString()}</div>
                    </div>
                    <Stack direction="horizontal" gap={2}>
                      {isCurrent ? <Badge bg="success">{t.currentSession}</Badge> : null}
                      {session.isRevoked ? <Badge bg="secondary">{t.sessionRevoked}</Badge> : null}
                    </Stack>
                  </div>
                  {!session.isRevoked ? (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => revokeSessionMutation.mutate(session.sessionId, { onSuccess: () => { if (isCurrent) { clearAuthSession() } } })}
                    >
                      {t.revokeSession}
                    </Button>
                  ) : null}
                </Stack>
              </ListGroup.Item>
            )
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  )
}