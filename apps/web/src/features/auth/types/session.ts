export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface Session {
  accountId: string;
  accessToken: string | null;
  /** `null` enquanto o onboarding da conta estiver pendente (RF-ONB-01). */
  onboardingCompletedAt: string | null;
  user: SessionUser;
}

/**
 * Resposta de `POST /auth/google` e `POST /auth/refresh` — o `SessionDto` da API.
 *
 * Note que ela não devolve `accountId` solto nem `onboardingCompletedAt`: a conta
 * vem inteira e o atalho de redirecionamento é `onboardingPending`. Converter
 * isto na `Session` local é trabalho de `use-session` quando o OAuth entrar.
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
  /** `code` do OAuth ou `id_token`, conforme o fluxo que a API adotar. */
  credential: string;
}
