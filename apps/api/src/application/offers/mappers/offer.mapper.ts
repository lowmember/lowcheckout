import type { OfferDto } from "@/application/offers/dtos/offer.dto";
import type { Offer } from "@/domain/offers/entities/offer.entity";
import { resolveDeliveryUrl } from "@/domain/offers/policies/deliverable.policy";

export function toOfferDto(offer: Offer, productDefaultDeliveryUrl: string | null): OfferDto {
  const snapshot = offer.toSnapshot();

  return {
    id: snapshot.id,
    productId: snapshot.productId,
    name: snapshot.name,
    priceInCents: snapshot.priceInCents,
    currency: snapshot.currency,
    deliveryUrl: snapshot.deliveryUrl,
    resolvedDeliveryUrl: resolveDeliveryUrl(snapshot.deliveryUrl, productDefaultDeliveryUrl),
    status: snapshot.status,
    createdAt: snapshot.createdAt.toISOString(),
    updatedAt: snapshot.updatedAt.toISOString(),
  };
}
