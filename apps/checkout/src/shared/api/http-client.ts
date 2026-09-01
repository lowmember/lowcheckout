import axios from "axios";

import { env } from "@/shared/config/env";

/**
 * Cliente HTTP da página pública.
 *
 * Sem interceptor de `Authorization` e sem renovação de sessão, de propósito:
 * o comprador não tem conta (blueprint §6), e as rotas `/public/*` são as
 * únicas da API que dispensam `principal`. Um 401 aqui seria bug de rota, não
 * sessão expirada — e por isso não existe nada para repetir.
 */
export const httpClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});
