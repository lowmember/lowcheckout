import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

export class OfferAlreadyLinkedError extends InvariantViolationError {
  override readonly code = "offer_already_linked";

  constructor(checkoutId: string, offerId: string) {
    super(`A oferta ${offerId} já está vinculada ao checkout ${checkoutId}`);
  }
}
