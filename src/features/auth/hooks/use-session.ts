import { useSyncExternalStore } from "react";

import { startDevSession } from "@/features/auth/api/auth.api";
import { toSession } from "@/features/auth/lib/dev-session";
import {
  getSession,
  patchSession,
  setSession,
  subscribeToSession,
} from "@/features/auth/lib/session-store";

/**
 * Ponto único de troca da autenticação.
 *
 * TODO(RF-AUTH-01): `signIn` provisiona hoje a conta de desenvolvimento na API.
 * Quando o OAuth entrar, troque `startDevSession()` por `signInWithGoogle(...)` —
 * a resposta tem o mesmo shape, então nada além desta linha precisa mudar.
 */
export function useSession() {
  const session = useSyncExternalStore(subscribeToSession, getSession, getSession);

  return {
    session,
    isAuthenticated: session !== null,
    hasCompletedOnboarding: session?.onboardingCompletedAt !== null,
    signIn: async () => {
      const session = toSession(await startDevSession());
      setSession(session);
      return session;
    },
    signOut: () => setSession(null),
    completeOnboarding: () => patchSession({ onboardingCompletedAt: new Date().toISOString() }),
    updateSessionUser: (name: string) => {
      const current = getSession();
      if (current) patchSession({ user: { ...current.user, name } });
    },
  };
}
