import { useState } from 'react'
import { Badge, Button, Container, Nav, Navbar, Spinner, Stack } from 'react-bootstrap'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { LanguageSelect } from './components/LanguageSelect'
import { useLanguageContext } from './contexts/LanguageContext'
import { useSessionContext } from './contexts/SessionContext'
import { useLogoutAction } from './lib/useLogoutAction'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { FoodLogPage } from './pages/FoodLogPage'
import { ProgressPage } from './pages/ProgressPage'
import { RecipesPage } from './pages/RecipesPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  const [expanded, setExpanded] = useState(false)
  const { authSession, isReady, queuedActions } = useSessionContext()
  const { t } = useLanguageContext()
  const { logout, isPending } = useLogoutAction()

  const navigation = [
    { to: '/', label: t.navDashboard },
    { to: '/log', label: t.navFoodLog },
    { to: '/progress', label: t.navProgress },
    { to: '/recipes', label: t.navRecipes },
    { to: '/settings', label: t.settings },
  ]

  if (!isReady) {
    return (
      <div className="app-shell d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="success" />
      </div>
    )
  }

  if (!authSession) {
    return <AuthPage />
  }

  return (
    <div className="app-shell">
      <Navbar expand="lg" className="foodie-navbar py-3" expanded={expanded}>
        <Container>
          <Navbar.Brand className="fw-semibold text-dark">{t.appName}</Navbar.Brand>
          <Navbar.Toggle aria-controls="foodie-navigation" onClick={() => setExpanded((value) => !value)} />
          <Navbar.Collapse id="foodie-navigation">
            <Nav className="ms-auto gap-lg-2">
              {navigation.map((item) => (
                <Nav.Link
                  as={NavLink}
                  to={item.to}
                  key={item.to}
                  end={item.to === '/'}
                  onClick={() => setExpanded(false)}
                >
                  {item.label}
                </Nav.Link>
              ))}
            </Nav>
            <Stack direction="horizontal" gap={2} className="ms-lg-3 align-items-center">
              <LanguageSelect className="form-select form-select-sm foodie-language-select" />
              <Badge bg="light" text="dark" pill>
                {authSession.userName}
              </Badge>
              <Badge bg={queuedActions > 0 ? 'warning' : 'success'} pill>
                {queuedActions > 0 ? t.queued(queuedActions) : t.synced}
              </Badge>
              <Button variant="outline-dark" size="sm" onClick={logout} disabled={isPending}>
                {t.logout}
              </Button>
            </Stack>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="pb-5">
        <Container className="py-4 py-lg-5">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/log" element={<FoodLogPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </main>
    </div>
  )
}

export default App