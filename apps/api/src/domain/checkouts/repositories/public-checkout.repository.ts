import type { Account } from "@/domain/accounts/entities/account.entity";
import type { Checkout } from "@/domain/checkouts/entities/checkout.entity";
import type { CheckoutOffer } from "@/domain/checkouts/entities/checkout-offer.entity";
import type { CheckoutPixel } from "@/domain/checkouts/entities/checkout-pixel.entity";
import type { Offer } from "@/domain/offers/entities/offer.entity";
import type { Product } from "@/domain/products/entities/product.entity";

/** Tudo o que a página pública precisa para existir, resolvido de uma vez. */
export interface PublicCheckoutView {
  account: Account;
  checkout: Checkout;
  checkoutOffer: CheckoutOffer;
  offer: Offer;
  product: Product;
  pixels: CheckoutPixel[];
}

/**
 * Porta de leitura da página pública. É intencionalmente uma consulta só: este é
 * o caminho mais quente do sistema (RF-PUB-01) e resolver seis agregados em seis
 * round-trips seria pagar caro por pureza.
 */
export interface PublicCheckoutRepository {
  findByPublicSlug(publicSlug: string): Promise<PublicCheckoutView | null>;
}
