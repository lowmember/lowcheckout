import type { CheckoutOfferDto } from "@/application/checkouts/dtos/checkout-offer.dto";
import type { CheckoutOffer } from "@/domain/checkouts/entities/checkout-offer.entity";

export function toCheckoutOfferDto(checkoutOffer: CheckoutOffer): CheckoutOfferDto {
  const snapshot = checkoutOffer.toSnapshot();

  return {
    id: snapshot.id,
    checkoutId: snapshot.checkoutId,
    offerId: snapshot.offerId,
    productId: snapshot.productId,
    publicSlug: snapshot.publicSlug,
    position: snapshot.position,
    isActive: snapshot.isActive,
    createdAt: snapshot.createdAt.toISOString(),
    updatedAt: snapshot.updatedAt.toISOString(),
  };
}
