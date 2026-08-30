import { useSyncExternalStore } from "react";

import { signInWithGoogle } from "@/features/auth/api/auth.api";
import { disableGoogleAutoSelect } from "@/features/auth/lib/google-identity";
import { toSession } from "@/features/auth/lib/session";
import {
  getSession,
  patchSession,
  setSession,
  subscribeToSession,
} from "@/features/auth/lib/session-store";

/** Ponto único de troca da autenticação (RF-AUTH-01). */
export function useSession() {
  const session = useSyncExternalStore(subscribeToSession, getSession, getSession);

  return {
    session,
    isAuthenticated: session !== null,
    hasCompletedOnboarding: session?.onboardingCompletedAt !== null,
    signIn: async (idToken: string) => {
      const session = toSession(await signInWithGoogle({ idToken }));
      setSession(session);
      return session;
    },
    signOut: () => {
      // Antes de limpar: senão o GIS reautentica na próxima visita (One Tap).
      disableGoogleAutoSelect();
      setSession(null);
    },
    completeOnboarding: () => patchSession({ onboardingCompletedAt: new Date().toISOString() }),
    updateSessionUser: (name: string) => {
      const current = getSession();
      if (current) patchSession({ user: { ...current.user, name } });
    },
  };
}
