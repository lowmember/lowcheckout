import { redirect } from "@tanstack/react-router";

import { getSession } from "@/features/auth/lib/session-store";

/** Guarda das rotas do painel: sem sessão, vai para /entrar (RF-AUTH-03). */
export function requireSession() {
  const session = getSession();

  if (!session) {
    throw redirect({ to: "/entrar" });
  }

  return session;
}

/** Onboarding é bloqueante: sem ele concluído, o painel não abre (RF-ONB-01). */
export function requireCompletedOnboarding() {
  const session = requireSession();

  if (session.onboardingCompletedAt === null) {
    throw redirect({ to: "/cadastro" });
  }

  return session;
}

/** Telas de acesso não fazem sentido para quem já está autenticado. */
export function requireGuest() {
  const session = getSession();

  if (session) {
    throw redirect({ to: session.onboardingCompletedAt === null ? "/cadastro" : "/" });
  }
}
