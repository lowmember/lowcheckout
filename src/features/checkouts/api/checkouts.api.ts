import type {
  Checkout,
  CreateCheckoutInput,
  ListCheckoutsParams,
  UpdateCheckoutInput,
} from "@/features/checkouts/types/checkout";
import { httpClient } from "@/shared/api/http-client";
import type { ApiResponse, PaginatedResponse } from "@/shared/api/types";

export async function listCheckouts(params: ListCheckoutsParams = {}) {
  const response = await httpClient.get<PaginatedResponse<Checkout>>("/checkouts", { params });
  return response.data;
}

export async function getCheckout(checkoutId: string) {
  const response = await httpClient.get<ApiResponse<Checkout>>(`/checkouts/${checkoutId}`);
  return response.data.data;
}

export async function createCheckout(input: CreateCheckoutInput) {
  const response = await httpClient.post<ApiResponse<Checkout>>("/checkouts", input);
  return response.data.data;
}

export async function updateCheckout(checkoutId: string, input: UpdateCheckoutInput) {
  const response = await httpClient.patch<ApiResponse<Checkout>>(`/checkouts/${checkoutId}`, input);
  return response.data.data;
}

export async function deleteCheckout(checkoutId: string) {
  await httpClient.delete(`/checkouts/${checkoutId}`);
}
