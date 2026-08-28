import type { GoogleSignInResponse, Session } from "@/features/auth/types/session";

/**
 * Converte o `SessionDto` da API na sessão local.
 *
 * TODO(RF-AUTH-01): é o mesmo shape que `POST /auth/google` vai devolver, então
 * ligar o OAuth de verdade não muda nada aqui — só quem chama.
 */
export function toSession(response: GoogleSignInResponse): Session {
  return {
    accountId: response.account.id,
    accessToken: response.accessToken,
    onboardingCompletedAt: response.account.onboardingCompletedAt,
    user: response.user,
  };
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
