import type { CreateOfferInput, Offer, UpdateOfferInput } from "@/features/offers/types/offer";
import { httpClient } from "@/shared/api/http-client";
import type { ApiResponse, PaginatedResponse } from "@/shared/api/types";

export async function listProductOffers(productId: string) {
  const response = await httpClient.get<PaginatedResponse<Offer>>(`/products/${productId}/offers`);
  return response.data;
}

export async function getOffer(offerId: string) {
  const response = await httpClient.get<ApiResponse<Offer>>(`/offers/${offerId}`);
  return response.data.data;
}

export async function createOffer(productId: string, input: CreateOfferInput) {
  const response = await httpClient.post<ApiResponse<Offer>>(
    `/products/${productId}/offers`,
    input,
  );
  return response.data.data;
}

export async function updateOffer(offerId: string, input: UpdateOfferInput) {
  const response = await httpClient.patch<ApiResponse<Offer>>(`/offers/${offerId}`, input);
  return response.data.data;
}

export async function deleteOffer(offerId: string) {
  await httpClient.delete(`/offers/${offerId}`);
}
