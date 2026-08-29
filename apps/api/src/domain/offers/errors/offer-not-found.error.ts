import { EntityNotFoundError } from "@/domain/shared/errors/domain.error";

export class OfferNotFoundError extends EntityNotFoundError {
  override readonly code = "offer_not_found";

  constructor(offerId: string) {
    super(`Oferta ${offerId} não encontrada`);
  }
}
