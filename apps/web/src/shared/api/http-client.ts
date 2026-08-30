import axios, { type InternalAxiosRequestConfig } from "axios";

import { clearAuthStorage, getAccessToken, getAccountId } from "@/shared/api/auth-storage";
import { refreshCurrentSession } from "@/shared/api/session-refresh";
import { env } from "@/shared/config/env";

/** Marca a requisição que já foi repetida, para um 401 não virar laço. */
interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  hasRetriedAfterRefresh?: boolean;
}

export const httpClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Fallback de identificação aceito pela API fora de produção, enquanto o
  // OAuth do Google não existe. Ver TODO(RF-AUTH-01) em features/auth.
  const accountId = getAccountId();

  if (accountId) {
    config.headers["x-account-id"] = accountId;
  }

  return config;
});

/**
 * O access token vive 15 minutos; a sessão, 30 dias. Sem esta renovação, toda
 * aba aberta por mais de 15 minutos passava a receber 401 no meio do trabalho
 * — e o builder perdia o rascunho não salvo. O 401 é trocado uma única vez por
 * uma renovação e a requisição original é repetida; se a renovação também
 * falhar, aí sim as credenciais são descartadas e o erro sobe para a tela.
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const request = error.config as RetriableRequestConfig | undefined;

    // A própria renovação respondendo 401 significa refresh token morto: não há
    // o que repetir, e insistir seria o laço que o `hasRetriedAfterRefresh` evita.
    if (!request || request.hasRetriedAfterRefresh || request.url?.endsWith("/auth/refresh")) {
      clearAuthStorage();
      return Promise.reject(error);
    }

    const accessToken = await refreshCurrentSession();

    if (!accessToken) {
      clearAuthStorage();
      return Promise.reject(error);
    }

    request.hasRetriedAfterRefresh = true;
    request.headers.Authorization = `Bearer ${accessToken}`;

    return httpClient.request(request);
  },
);
