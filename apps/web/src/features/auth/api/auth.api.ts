import type { GoogleSignInInput, GoogleSignInResponse } from "@/features/auth/types/session";
import { httpClient } from "@/shared/api/http-client";
import type { ApiResponse } from "@/shared/api/types";

/**
 * Sessão de desenvolvimento: provisiona (ou reencontra) a conta e o usuário de dev
 * na API e devolve o mesmo `SessionDto` do login Google. A rota responde 404 fora
 * de desenvolvimento.
 *
 * TODO(RF-AUTH-01): sai junto com esta função quando o OAuth do Google entrar.
 */
export async function startDevSession() {
  const response = await httpClient.post<ApiResponse<GoogleSignInResponse>>("/auth/dev-session");
  return response.data.data;
}

/** TODO(RF-AUTH-01): ainda não chamado — o painel usa `startDevSession`. */
export async function signInWithGoogle(input: GoogleSignInInput) {
  const response = await httpClient.post<ApiResponse<GoogleSignInResponse>>("/auth/google", input);
  return response.data.data;
}

export async function refreshSession() {
  const response = await httpClient.post<ApiResponse<GoogleSignInResponse>>("/auth/refresh");
  return response.data.data;
}

export async function signOutOnApi() {
  await httpClient.post("/auth/logout");
}
