import type { CheckoutOffer } from "@/domain/checkouts/entities/checkout-offer.entity";

/**
 * Porta de persistência do vínculo checkout↔oferta. É por aqui que a URL
 * pública nasce e morre (RF-CHK-05).
 */
export interface CheckoutOffersRepository {
  findByCheckout(accountId: string, checkoutId: string): Promise<CheckoutOffer[]>;
  findByCheckoutAndOffer(
    accountId: string,
    checkoutId: string,
    offerId: string,
  ): Promise<CheckoutOffer | null>;
  existsByPublicSlug(publicSlug: string): Promise<boolean>;
  nextPosition(accountId: string, checkoutId: string): Promise<number>;
  create(checkoutOffer: CheckoutOffer): Promise<void>;
  delete(accountId: string, checkoutId: string, offerId: string): Promise<boolean>;
}
