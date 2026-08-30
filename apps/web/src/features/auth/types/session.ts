export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface Session {
  accountId: string;
  accessToken: string | null;
  /** Renova o `accessToken` sem refazer o consentimento do Google (RF-AUTH-03). */
  refreshToken: string | null;
  /** `null` enquanto o onboarding da conta estiver pendente (RF-ONB-01). */
  onboardingCompletedAt: string | null;
  user: SessionUser;
}

/**
 * Resposta de `POST /auth/google` e `POST /auth/refresh` — o `SessionDto` da API.
 *
 * Note que ela não devolve `accountId` solto nem `onboardingCompletedAt`: a conta
 * vem inteira e o atalho de redirecionamento é `onboardingPending`. `toSession`
 * (lib/session.ts) converte isto na `Session` local.
 */
export interface GoogleSignInResponse {
  tokenType: "Bearer";
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  user: SessionUser;
  account: { id: string; onboardingCompletedAt: string | null };
  onboardingPending: boolean;
}

export interface GoogleSignInInput {
  /** O `credential` que o GIS devolve — id token JWT, validado contra o JWKS do Google. */
  idToken: string;
}
