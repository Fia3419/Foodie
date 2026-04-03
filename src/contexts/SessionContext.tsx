import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { queryClient } from '../lib/queryClient'
import { authSessionChangedEventName, clearStoredAuthSession, readStoredAuthSession, writeStoredAuthSession } from '../auth/authStorage'
import { syncOfflineMutations, getOfflineMutationCount } from '../offline/offlineQueue'
import { AuthSession, GoalMode } from '../types/models'

interface SessionContextValue {
  authSession: AuthSession | null
  isReady: boolean
  isOnline: boolean
  queuedActions: number
  selectedGoalMode: GoalMode
  setAuthSession: (session: AuthSession) => void
  clearAuthSession: () => void
  setSelectedGoalMode: (goalMode: GoalMode) => void
  refreshQueuedActions: (nextCount?: number) => Promise<void>
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [authSession, setAuthSessionState] = useState<AuthSession | null>(() => readStoredAuthSession())
  const [isReady, setIsReady] = useState(false)
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [queuedActions, setQueuedActions] = useState(0)
  const selectedGoalMode = authSession?.selectedGoalMode ?? GoalMode.GainStrength

  const refreshQueuedActions = async (nextCount?: number) => {
    if (typeof nextCount === 'number') {
      setQueuedActions(nextCount)
      return
    }

    if (!authSession) {
      setQueuedActions(0)
      return
    }

    const count = await getOfflineMutationCount(authSession.email)
    setQueuedActions(count)
  }

  useEffect(() => {
    const handleSessionChanged = () => {
      setAuthSessionState(readStoredAuthSession())
    }

    window.addEventListener(authSessionChangedEventName, handleSessionChanged)

    return () => {
      window.removeEventListener(authSessionChangedEventName, handleSessionChanged)
    }
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    void refreshQueuedActions().finally(() => setIsReady(true))
  }, [authSession])

  useEffect(() => {
    if (!authSession || !isOnline) {
      return
    }

    let isCancelled = false

    const runSync = async () => {
      const syncedCount = await syncOfflineMutations(authSession.email)

      if (isCancelled) {
        return
      }

      await refreshQueuedActions()

      if (syncedCount > 0) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['daily-log'] }),
          queryClient.invalidateQueries({ queryKey: ['weight-trend'] }),
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
          queryClient.invalidateQueries({ queryKey: ['session-profile'] }),
        ])
      }
    }

    void runSync()

    return () => {
      isCancelled = true
    }
  }, [authSession, isOnline])

  const setAuthSession = (session: AuthSession) => {
    writeStoredAuthSession(session)
    setAuthSessionState(session)
  }

  const clearAuthSessionValue = () => {
    clearStoredAuthSession()
    setAuthSessionState(null)
    setQueuedActions(0)
    queryClient.clear()
  }

  const setSelectedGoalMode = (goalMode: GoalMode) => {
    if (!authSession) {
      return
    }

    const nextSession = { ...authSession, selectedGoalMode: goalMode }
    writeStoredAuthSession(nextSession)
    setAuthSessionState(nextSession)
  }

  const value = useMemo(
    () => ({
      authSession,
      isReady,
      isOnline,
      queuedActions,
      selectedGoalMode,
      setAuthSession,
      clearAuthSession: clearAuthSessionValue,
      setSelectedGoalMode,
      refreshQueuedActions,
    }),
    [authSession, isOnline, isReady, queuedActions, selectedGoalMode],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export const useSessionContext = () => {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error('useSessionContext must be used within SessionProvider')
  }

  return context
}