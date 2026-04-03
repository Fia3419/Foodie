import { useLogoutMutation } from "../api/foodieApi";
import { useSessionContext } from "../contexts/SessionContext";

export const useLogoutAction = () => {
  const { authSession, clearAuthSession } = useSessionContext();
  const logoutMutation = useLogoutMutation();

  const logout = () => {
    if (!authSession) {
      clearAuthSession();
      return;
    }

    logoutMutation.mutate(authSession.sessionId, {
      onSettled: () => {
        clearAuthSession();
      },
    });
  };

  return {
    logout,
    isPending: logoutMutation.isPending,
  };
};
