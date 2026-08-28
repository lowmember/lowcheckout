import type {
  Checkout,
  CheckoutListItem,
  CheckoutOfferListItem,
  CheckoutPixel,
  CheckoutPixelInput,
  CreateCheckoutInput,
  ListCheckoutsParams,
  UpdateCheckoutInput,
} from "@/features/checkouts/types/checkout";
import type {
  CheckoutCustomization,
  CustomizationSource,
} from "@/features/checkouts/types/customization";
import { httpClient } from "@/shared/api/http-client";
import type { ApiResponse, PaginatedResponse } from "@/shared/api/types";

export async function listCheckouts(params: ListCheckoutsParams = {}) {
  const response = await httpClient.get<PaginatedResponse<CheckoutListItem>>("/checkouts", {
    params,
  });
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

/* — Ofertas vinculadas (RF-CHK-05) — */

export async function listCheckoutOffers(checkoutId: string) {
  const response = await httpClient.get<PaginatedResponse<CheckoutOfferListItem>>(
    `/checkouts/${checkoutId}/offers`,
  );
  return response.data;
}

export async function linkOfferToCheckout(checkoutId: string, offerId: string) {
  const response = await httpClient.post<ApiResponse<CheckoutOfferListItem>>(
    `/checkouts/${checkoutId}/offers`,
    { offerId },
  );
  return response.data.data;
}

export async function unlinkOfferFromCheckout(checkoutId: string, offerId: string) {
  await httpClient.delete(`/checkouts/${checkoutId}/offers/${offerId}`);
}

/* — Builder (RF-CHK-07/08) — */

export async function saveCheckoutCustomization(
  checkoutId: string,
  input: { customization: CheckoutCustomization; source: CustomizationSource },
) {
  const response = await httpClient.put<ApiResponse<Checkout>>(
    `/checkouts/${checkoutId}/customization`,
    input,
  );
  return response.data.data;
}

/* — Tracking (RF-CHK-10) — */

export async function getCheckoutPixels(checkoutId: string) {
  const response = await httpClient.get<ApiResponse<CheckoutPixel[]>>(
    `/checkouts/${checkoutId}/pixels`,
  );
  return response.data.data;
}

export async function saveCheckoutPixels(checkoutId: string, pixels: CheckoutPixelInput[]) {
  const response = await httpClient.put<ApiResponse<CheckoutPixel[]>>(
    `/checkouts/${checkoutId}/pixels`,
    { pixels },
  );
  return response.data.data;
}
