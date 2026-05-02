import { useState } from 'react'
import { Badge, Button, Container, Nav, Navbar, Spinner, Stack } from 'react-bootstrap'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { FoodieIcon, type FoodieIconName } from './components/ColorfulVisuals'
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
    { to: '/', label: t.navDashboard, icon: 'dashboard' },
    { to: '/log', label: t.navFoodLog, icon: 'foodLog' },
    { to: '/progress', label: t.navProgress, icon: 'progress' },
    { to: '/recipes', label: t.navRecipes, icon: 'recipes' },
    { to: '/settings', label: t.settings, icon: 'settings' },
  ] satisfies Array<{ to: string; label: string; icon: FoodieIconName }>

  if (!isReady) {
    return (
      <div className="app-shell d-flex align-items-center justify-content-center" role="status" aria-live="polite">
        <Spinner animation="border" variant="success" />
        <span className="visually-hidden">{t.dashboardLoading}</span>
      </div>
    )
  }

  if (!authSession) {
    return <AuthPage />
  }

  return (
    <div className="app-shell">
      <a className="visually-hidden-focusable foodie-skip-link" href="#main-content">
        {t.skipToContent}
      </a>
      <header>
        <Navbar expand="lg" className="foodie-navbar py-3" expanded={expanded}>
          <Container>
            <Navbar.Brand className="foodie-brand fw-semibold text-dark" as="span">
              <span className="foodie-brand-mark">
                <FoodieIcon name="spark" className="foodie-brand-icon" />
              </span>
              <span>{t.appName}</span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="foodie-navigation" aria-label={t.primaryNavigationLabel} onClick={() => setExpanded((value) => !value)} />
            <Navbar.Collapse id="foodie-navigation">
              <Nav as="ul" className="ms-auto gap-lg-2" aria-label={t.primaryNavigationLabel}>
                {navigation.map((item) => (
                  <Nav.Item as="li" key={item.to}>
                    <Nav.Link
                      as={NavLink}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setExpanded(false)}
                    >
                      <span className="foodie-nav-link-content">
                        <FoodieIcon name={item.icon} className="foodie-nav-icon" />
                        <span>{item.label}</span>
                      </span>
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
              <Stack direction="horizontal" gap={2} className="ms-lg-3 align-items-center" aria-label={t.userMenuLabel}>
                <LanguageSelect className="form-select form-select-sm foodie-language-select" />
                <Badge bg="light" text="dark" pill>
                  <span className="visually-hidden">{t.name}: </span>
                  {authSession.userName}
                </Badge>
                <Badge
                  bg={queuedActions > 0 ? 'warning' : 'success'}
                  pill
                  role="status"
                  aria-live="polite"
                  aria-label={t.syncStatusBadgeLabel}
                >
                  {queuedActions > 0 ? t.queued(queuedActions) : t.synced}
                </Badge>
                <Button variant="outline-dark" size="sm" onClick={logout} disabled={isPending}>
                  {t.logout}
                </Button>
              </Stack>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>

      <main id="main-content" className="pb-5" tabIndex={-1}>
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