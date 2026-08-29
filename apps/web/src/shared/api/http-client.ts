import axios from "axios";

import { clearAuthStorage, getAccessToken, getAccountId } from "@/shared/api/auth-storage";
import { env } from "@/shared/config/env";

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

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAuthStorage();
    }

    return Promise.reject(error);
  },
);
