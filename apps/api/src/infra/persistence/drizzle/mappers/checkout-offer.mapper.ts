import { CheckoutOffer } from "@/domain/checkouts/entities/checkout-offer.entity";
import type { CheckoutOfferRow, NewCheckoutOfferRow } from "@/infra/persistence/drizzle/schema";

export function toCheckoutOffer(row: CheckoutOfferRow): CheckoutOffer {
  return CheckoutOffer.restore({
    id: row.id,
    accountId: row.accountId,
    checkoutId: row.checkoutId,
    offerId: row.offerId,
    productId: row.productId,
    publicSlug: row.publicSlug,
    position: row.position,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function toCheckoutOfferRow(checkoutOffer: CheckoutOffer): NewCheckoutOfferRow {
  const snapshot = checkoutOffer.toSnapshot();

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    checkoutId: snapshot.checkoutId,
    offerId: snapshot.offerId,
    productId: snapshot.productId,
    publicSlug: snapshot.publicSlug,
    position: snapshot.position,
    isActive: snapshot.isActive,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}
