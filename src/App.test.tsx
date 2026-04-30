import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { GoalMode, type AuthSession } from './types/models'

const mockLogout = vi.fn()

let mockLanguage = {
  t: {
    appName: 'Foodie',
    navDashboard: 'Dashboard',
    navFoodLog: 'Food log',
    navProgress: 'Progress',
    navRecipes: 'Recipes',
    settings: 'Settings',
    logout: 'Log out',
    synced: 'Synced',
    queued: (count: number) => `${count} queued`,
  },
}

let mockSession: {
  authSession: AuthSession | null
  isReady: boolean
  queuedActions: number
} = {
  authSession: null,
  isReady: true,
  queuedActions: 0,
}

vi.mock('./components/LanguageSelect', () => ({
  LanguageSelect: () => <div>language-select</div>,
}))

vi.mock('./contexts/LanguageContext', () => ({
  useLanguageContext: () => mockLanguage,
}))

vi.mock('./contexts/SessionContext', () => ({
  useSessionContext: () => mockSession,
}))

vi.mock('./lib/useLogoutAction', () => ({
  useLogoutAction: () => ({ logout: mockLogout, isPending: false }),
}))

vi.mock('./pages/AuthPage', () => ({
  AuthPage: () => <div>auth-page</div>,
}))

vi.mock('./pages/DashboardPage', () => ({
  DashboardPage: () => <div>dashboard-page</div>,
}))

vi.mock('./pages/FoodLogPage', () => ({
  FoodLogPage: () => <div>food-log-page</div>,
}))

vi.mock('./pages/ProgressPage', () => ({
  ProgressPage: () => <div>progress-page</div>,
}))

vi.mock('./pages/RecipesPage', () => ({
  RecipesPage: () => <div>recipes-page</div>,
}))

vi.mock('./pages/SettingsPage', () => ({
  SettingsPage: () => <div>settings-page</div>,
}))

const createSession = (): AuthSession => ({
  userId: 'user-1',
  sessionId: 'session-1',
  userName: 'Casey',
  email: 'casey@example.com',
  selectedGoalMode: GoalMode.GeneralHealth,
  accessToken: 'access',
  refreshToken: 'refresh',
  accessTokenExpiresAtUtc: '2026-01-01T00:00:00Z',
  refreshTokenExpiresAtUtc: '2026-01-02T00:00:00Z',
})

describe('App', () => {
  beforeEach(() => {
    mockLogout.mockReset()
    mockSession = {
      authSession: null,
      isReady: true,
      queuedActions: 0,
    }
  })

  it('renders the auth page when there is no active session', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText('auth-page')).toBeInTheDocument()
    expect(screen.queryByText('dashboard-page')).not.toBeInTheDocument()
  })

  it('renders the active route and session badges for signed-in users', () => {
    mockSession = {
      authSession: createSession(),
      isReady: true,
      queuedActions: 2,
    }

    render(
      <MemoryRouter initialEntries={['/recipes']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText('recipes-page')).toBeInTheDocument()
    expect(screen.getByText('Casey')).toBeInTheDocument()
    expect(screen.getByText('2 queued')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument()
  })
})