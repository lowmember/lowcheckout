import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/**
 * Invariante (a), metade de domínio: só ofertas do mesmo produto do checkout
 * podem ser vinculadas (RF-CHK-05). O banco reforça com FKs compostas.
 */
export class OfferProductMismatchError extends InvariantViolationError {
  override readonly code = "offer_product_mismatch";

  constructor(checkoutProductId: string, offerProductId: string) {
    super(
      `A oferta pertence ao produto ${offerProductId} e o checkout vende o produto ${checkoutProductId}: só ofertas do mesmo produto podem ser vinculadas`,
    );
  }
}
