import type { CheckoutPixel } from "@/domain/checkouts/entities/checkout-pixel.entity";
import type { PixelProvider } from "@/domain/checkouts/value-objects/pixel-provider";

/**
 * Porta dos pixels de um checkout. A escrita é sempre do conjunto inteiro:
 * remover um provider da lista é o que desliga o pixel na página pública
 * (RF-CHK-10).
 */
export interface CheckoutPixelsRepository {
  findByCheckout(accountId: string, checkoutId: string): Promise<CheckoutPixel[]>;
  create(pixel: CheckoutPixel): Promise<void>;
  update(pixel: CheckoutPixel): Promise<void>;
  deleteByProviders(
    accountId: string,
    checkoutId: string,
    providers: readonly PixelProvider[],
  ): Promise<void>;
}
