import type {
  CreatePixOrderInput,
  PixOrder,
  PublicCheckout,
} from "@/features/checkouts/types/public-checkout";
import { httpClient } from "@/shared/api/http-client";
import type { ApiResponse } from "@/shared/api/types";

/* — Página pública: sem sessão, resolvida pelo slug do vínculo (RF-CHK-05) — */

export async function getPublicCheckout(publicSlug: string) {
  const response = await httpClient.get<ApiResponse<PublicCheckout>>(
    `/public/checkouts/${publicSlug}`,
  );
  return response.data.data;
}

export async function createPixOrder(publicSlug: string, input: CreatePixOrderInput) {
  const response = await httpClient.post<ApiResponse<PixOrder>>(
    `/public/checkouts/${publicSlug}/orders`,
    input,
  );
  return response.data.data;
}

export async function getPixOrder(orderId: string) {
  const response = await httpClient.get<ApiResponse<PixOrder>>(`/public/orders/${orderId}`);
  return response.data.data;
}
