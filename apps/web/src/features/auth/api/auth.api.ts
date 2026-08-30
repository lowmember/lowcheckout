import type { GoogleSignInInput, GoogleSignInResponse } from "@/features/auth/types/session";
import { httpClient } from "@/shared/api/http-client";
import type { ApiResponse } from "@/shared/api/types";

/** Troca o id token do Google pela sessão da API (RF-AUTH-01). */
export async function signInWithGoogle(input: GoogleSignInInput) {
  const response = await httpClient.post<ApiResponse<GoogleSignInResponse>>("/auth/google", input);
  return response.data.data;
}

/** O refresh token é rotacionado pela API: a resposta traz um novo par. */
export async function refreshSession(refreshToken: string) {
  const response = await httpClient.post<ApiResponse<GoogleSignInResponse>>("/auth/refresh", {
    refreshToken,
  });
  return response.data.data;
}

export async function signOutOnApi() {
  await httpClient.post("/auth/logout");
}
