import type { PublicCheckout, PublicOrder, PublicOrderStatus } from "@lowcheckout/contracts";

import { httpClient } from "@/shared/api/http-client";
import type { ApiResponse } from "@/shared/api/types";

/* — Módulo PUB: as rotas da API que não pedem sessão (RF-PUB-01 a RF-PUB-06) — */

export interface CreatePublicOrderInput {
  buyerName: string;
  buyerEmail: string;
  /** Só dígitos: a máscara é da tela, o CPF que viaja é limpo. */
  buyerDocument: string;
  visitorId: string | null;
}

export async function getPublicCheckout(publicSlug: string, visitorId: string | null) {
  const response = await httpClient.get<ApiResponse<PublicCheckout>>(
    `/public/checkouts/${encodeURIComponent(publicSlug)}`,
    { params: visitorId ? { visitorId } : undefined },
  );

  return response.data.data;
}

export async function createPublicOrder(publicSlug: string, input: CreatePublicOrderInput) {
  const response = await httpClient.post<ApiResponse<PublicOrder>>(
    `/public/checkouts/${encodeURIComponent(publicSlug)}/orders`,
    input,
  );

  return response.data.data;
}

export async function getPublicOrder(orderId: string) {
  const response = await httpClient.get<ApiResponse<PublicOrder>>(`/public/orders/${orderId}`);

  return response.data.data;
}

/** Resposta enxuta, feita para o polling da tela do PIX (RF-PUB-05). */
export async function getPublicOrderStatus(orderId: string) {
  const response = await httpClient.get<ApiResponse<PublicOrderStatus>>(
    `/public/orders/${orderId}/status`,
  );

  return response.data.data;
}
