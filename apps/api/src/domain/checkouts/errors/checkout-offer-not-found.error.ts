import { EntityNotFoundError } from "@/domain/shared/errors/domain.error";

export class CheckoutOfferNotFoundError extends EntityNotFoundError {
  override readonly code = "checkout_offer_not_found";

  constructor(checkoutId: string, offerId: string) {
    super(`A oferta ${offerId} não está vinculada ao checkout ${checkoutId}`);
  }
}
