import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { translations } from '../i18n/translations'
import { AuthPage } from './AuthPage'

const mockSetAuthSession = vi.fn()

type MutationOptions<TResponse> = {
  onSuccess?: (response: TResponse) => void
}

let loginMutation = {
  mutate: vi.fn(),
  isPending: false,
  error: null,
}

let registerMutation = {
  mutate: vi.fn(),
  isPending: false,
  error: null,
}

let forgotPasswordMutation = {
  mutate: vi.fn(),
  isPending: false,
  error: null,
}

let resetPasswordMutation = {
  mutate: vi.fn(),
  isPending: false,
  error: null,
}

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
    setAuthSession: mockSetAuthSession,
  }),
}))

vi.mock('../api/foodieApi', () => ({
  useLoginMutation: () => loginMutation,
  useRegisterMutation: () => registerMutation,
  useForgotPasswordMutation: () => forgotPasswordMutation,
  useResetPasswordMutation: () => resetPasswordMutation,
}))

describe('AuthPage', () => {
  beforeEach(() => {
    mockSetAuthSession.mockReset()
    loginMutation = {
      mutate: vi.fn(),
      isPending: false,
      error: null,
    }
    registerMutation = {
      mutate: vi.fn(),
      isPending: false,
      error: null,
    }
    forgotPasswordMutation = {
      mutate: vi.fn(),
      isPending: false,
      error: null,
    }
    resetPasswordMutation = {
      mutate: vi.fn(),
      isPending: false,
      error: null,
    }
  })

  it('fills the reset form and shows the development reset code after a reset request succeeds', async () => {
    forgotPasswordMutation.mutate = vi.fn((request: { email: string }, options?: MutationOptions<{ message: string; previewResetCode: string | null }>) => {
      expect(request).toEqual({ email: 'casey@example.com' })
      options?.onSuccess?.({
        message: translations.en.passwordResetRequestSuccess,
        previewResetCode: 'ZXCVBN1234',
      })
    })

    render(<AuthPage />)

    fireEvent.click(screen.getByRole('tab', { name: translations.en.forgotPassword }))

    const requestSection = screen.getByRole('heading', { name: translations.en.requestPasswordReset }).parentElement
    const resetSection = screen.getByRole('heading', { name: translations.en.resetPassword }).parentElement

    if (!requestSection || !resetSection) {
      throw new Error('Forgot password sections were not rendered')
    }

    fireEvent.change(within(requestSection).getByLabelText(translations.en.email), {
      target: { value: 'casey@example.com' },
    })

    fireEvent.click(within(requestSection).getByRole('button', { name: translations.en.requestPasswordReset }))

    await waitFor(() => {
      expect(screen.getByText(translations.en.passwordResetRequestSuccess)).toBeInTheDocument()
      expect(screen.getByText('ZXCVBN1234')).toBeInTheDocument()
      expect(within(resetSection).getByLabelText(translations.en.email)).toHaveValue('casey@example.com')
      expect(within(resetSection).getByLabelText(translations.en.resetCode)).toHaveValue('ZXCVBN1234')
    })
  })

  it('returns to login with the reset email prefilled after a successful password reset', async () => {
    resetPasswordMutation.mutate = vi.fn(
      (
        request: { email: string; resetCode: string; newPassword: string },
        options?: MutationOptions<{ message: string }>,
      ) => {
        expect(request).toEqual({
          email: 'casey@example.com',
          resetCode: 'ZXCVBN1234',
          newPassword: 'NewSecurePass1!',
        })
        options?.onSuccess?.({ message: translations.en.passwordResetSuccess })
      },
    )

    render(<AuthPage />)

    fireEvent.click(screen.getByRole('tab', { name: translations.en.forgotPassword }))

    const resetSection = screen.getByRole('heading', { name: translations.en.resetPassword }).parentElement

    if (!resetSection) {
      throw new Error('Reset password section was not rendered')
    }

    fireEvent.change(within(resetSection).getByLabelText(translations.en.email), {
      target: { value: 'casey@example.com' },
    })
    fireEvent.change(within(resetSection).getByLabelText(translations.en.resetCode), {
      target: { value: 'zxcvbn1234' },
    })
    fireEvent.change(within(resetSection).getByLabelText(translations.en.newPassword), {
      target: { value: 'NewSecurePass1!' },
    })
    fireEvent.change(within(resetSection).getByLabelText(translations.en.confirmPassword), {
      target: { value: 'NewSecurePass1!' },
    })

    fireEvent.click(within(resetSection).getByRole('button', { name: translations.en.resetPassword }))

    await waitFor(() => {
      const loginEmailField = document.getElementById('login-email') as HTMLInputElement | null
      expect(loginEmailField).not.toBeNull()
      expect(loginEmailField?.value).toBe('casey@example.com')
    })
  })
})