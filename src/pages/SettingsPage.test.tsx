import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { translations } from '../i18n/translations'
import { GoalMode, type AuthSession } from '../types/models'
import { SettingsPage } from './SettingsPage'

const mockLogout = vi.fn()

type MutationOptions<TResponse> = {
  onSuccess?: (response: TResponse) => void
}

let changePasswordMutation = {
  mutate: vi.fn(),
  isPending: false,
  error: null,
}

const createSession = (): AuthSession => ({
  userId: 'user-1',
  sessionId: 'session-1',
  userName: 'Casey',
  email: 'casey@example.com',
  selectedGoalMode: GoalMode.GainStrength,
  accessToken: 'access',
  refreshToken: 'refresh',
  accessTokenExpiresAtUtc: '2026-01-01T00:00:00Z',
  refreshTokenExpiresAtUtc: '2026-01-02T00:00:00Z',
})

vi.mock('../components/LanguageSelect', () => ({
  LanguageSelect: () => <div>language-select</div>,
}))

vi.mock('../contexts/LanguageContext', () => ({
  useLanguageContext: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: translations.en,
  }),
}))

vi.mock('../contexts/SessionContext', () => ({
  useSessionContext: () => ({
    authSession: createSession(),
    isOnline: true,
    queuedActions: 0,
  }),
}))

vi.mock('../lib/useLogoutAction', () => ({
  useLogoutAction: () => ({ logout: mockLogout, isPending: false }),
}))

vi.mock('../api/foodieApi', () => ({
  useChangePasswordMutation: () => changePasswordMutation,
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    mockLogout.mockReset()
    changePasswordMutation = {
      mutate: vi.fn(),
      isPending: false,
      error: null,
    }
  })

  it('submits a password change and clears the form after success', async () => {
    changePasswordMutation.mutate = vi.fn(
      (
        request: { currentPassword: string; newPassword: string },
        options?: MutationOptions<{ message: string }>,
      ) => {
        expect(request).toEqual({
          currentPassword: 'CurrentSecurePass1!',
          newPassword: 'NewSecurePass1!',
        })
        options?.onSuccess?.({ message: translations.en.passwordChangeSuccess })
      },
    )

    render(<SettingsPage />)

    fireEvent.change(screen.getByLabelText(translations.en.currentPassword), {
      target: { value: 'CurrentSecurePass1!' },
    })
    fireEvent.change(screen.getByLabelText(translations.en.newPassword), {
      target: { value: 'NewSecurePass1!' },
    })
    fireEvent.change(screen.getByLabelText(translations.en.confirmPassword), {
      target: { value: 'NewSecurePass1!' },
    })

    fireEvent.click(screen.getByRole('button', { name: translations.en.changePassword }))

    await waitFor(() => {
      expect(screen.getByText(translations.en.passwordChangeSuccess)).toBeInTheDocument()
      expect(screen.getByLabelText(translations.en.currentPassword)).toHaveValue('')
      expect(screen.getByLabelText(translations.en.newPassword)).toHaveValue('')
      expect(screen.getByLabelText(translations.en.confirmPassword)).toHaveValue('')
    })
  })

  it('keeps the change password action disabled until the confirmation matches', () => {
    render(<SettingsPage />)

    fireEvent.change(screen.getByLabelText(translations.en.currentPassword), {
      target: { value: 'CurrentSecurePass1!' },
    })
    fireEvent.change(screen.getByLabelText(translations.en.newPassword), {
      target: { value: 'NewSecurePass1!' },
    })
    fireEvent.change(screen.getByLabelText(translations.en.confirmPassword), {
      target: { value: 'MismatchPass1!' },
    })

    expect(screen.getByText(translations.en.passwordMismatch)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: translations.en.changePassword })).toBeDisabled()
    expect(changePasswordMutation.mutate).not.toHaveBeenCalled()
  })

  it('persists the selected default meal in local storage', async () => {
    window.localStorage.setItem('foodie:default-meal', 'Dinner')

    render(<SettingsPage />)

    const mealSelect = screen.getByRole('combobox', { name: translations.en.defaultMealLabel })

    expect(mealSelect).toHaveValue('Dinner')

    fireEvent.change(mealSelect, { target: { value: 'Lunch' } })

    await waitFor(() => {
      expect(window.localStorage.getItem('foodie:default-meal')).toBe('Lunch')
    })
  })
})