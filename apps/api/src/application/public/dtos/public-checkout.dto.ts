import type { CheckoutCustomizationProps } from "@/domain/checkouts/value-objects/checkout-customization";
import type { PixelProvider } from "@/domain/checkouts/value-objects/pixel-provider";

/**
 * O que a página pública recebe. Contém **apenas** o necessário para comprar:
 * nada de nome do negócio, documento, e-mail de contato ou qualquer dado
 * interno da conta (RNF de isolamento).
 */
export interface PublicCheckoutDto {
  publicSlug: string;
  displayName: string;
  bannerDesktopUrl: string | null;
  bannerMobileUrl: string | null;
  customization: CheckoutCustomizationProps;
  product: {
    name: string;
    description: string | null;
    imageUrl: string | null;
  };
  offer: {
    priceInCents: number;
    currency: string;
  };
  /** `false` quando a conta não tem gateway conectado: a página não gera PIX (RF-GTW-03). */
  paymentAvailable: boolean;
  /** Só o id do pixel, que o browser precisa para disparar eventos. Nunca o token. */
  pixels: { provider: PixelProvider; externalId: string }[];
  /** Devolvido para o browser reusar o mesmo visitante nos eventos seguintes. */
  visitorId: string;
}
