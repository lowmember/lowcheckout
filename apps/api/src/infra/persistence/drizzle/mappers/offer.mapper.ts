import { Offer } from "@/domain/offers/entities/offer.entity";
import { toOfferStatus } from "@/domain/offers/value-objects/offer-status";
import type { NewOfferRow, OfferRow } from "@/infra/persistence/drizzle/schema";

export function toOffer(row: OfferRow): Offer {
  return Offer.restore({
    id: row.id,
    accountId: row.accountId,
    productId: row.productId,
    name: row.name,
    priceInCents: row.priceInCents,
    currency: row.currency,
    imageUrl: row.imageUrl,
    deliveryUrl: row.deliveryUrl,
    status: toOfferStatus(row.status),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function toOfferRow(offer: Offer): NewOfferRow {
  const snapshot = offer.toSnapshot();

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    productId: snapshot.productId,
    name: snapshot.name,
    priceInCents: snapshot.priceInCents,
    currency: snapshot.currency,
    imageUrl: snapshot.imageUrl,
    deliveryUrl: snapshot.deliveryUrl,
    status: snapshot.status,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}
