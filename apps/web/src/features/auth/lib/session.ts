import type { GoogleSignInResponse, Session } from "@/features/auth/types/session";

/** Converte o `SessionDto` de `POST /auth/google` e `/auth/refresh` na sessão local. */
export function toSession(response: GoogleSignInResponse): Session {
  return {
    accountId: response.account.id,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
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
