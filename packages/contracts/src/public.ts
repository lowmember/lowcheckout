import type { CheckoutCustomization, PixelProvider } from "./checkouts";
import type { OrderStatus } from "./orders";

/**
 * O que a página pública recebe. Contém **apenas** o necessário para comprar:
 * nada de nome do negócio, documento ou e-mail de contato da conta.
 */
export interface PublicCheckout {
  publicSlug: string;
  displayName: string;
  bannerDesktopUrl: string | null;
  bannerMobileUrl: string | null;
  customization: CheckoutCustomization;
  product: {
    name: string;
    description: string | null;
    imageUrl: string | null;
  };
  offer: {
    priceInCents: number;
    currency: string;
  };
  /** `false` quando a conta não tem gateway conectado: a página não gera PIX. */
  paymentAvailable: boolean;
  /** Só o id do pixel, que o browser precisa para disparar eventos. Nunca o token. */
  pixels: { provider: PixelProvider; externalId: string }[];
  /** Devolvido para o browser reusar o mesmo visitante nos eventos seguintes. */
  visitorId: string;
}

/** Tela do PIX (RF-PUB-04). */
export interface PublicOrderPix {
  qrCodePayload: string | null;
  qrCodeImageUrl: string | null;
  expiresAt: string;
}

export interface PublicOrder {
  id: string;
  status: OrderStatus;
  amountInCents: number;
  currency: string;
  productName: string;
  offerName: string;
  buyerName: string;
  expiresAt: string;
  paidAt: string | null;
  pix: PublicOrderPix | null;
  /**
   * Só é preenchido quando o pedido está **pago** (RF-PUB-06): acessar a tela
   * de obrigado de um pedido não pago não pode entregar o produto.
   */
  deliveryUrl: string | null;
}

/** Resposta enxuta do polling da tela do PIX (RF-PUB-05). */
export interface PublicOrderStatus {
  id: string;
  status: OrderStatus;
  expiresAt: string;
  paidAt: string | null;
}

/** Resposta do webhook. Sempre 200 quando o evento foi aceito — duplicado incluso. */
export interface WebhookResult {
  received: true;
  /** `duplicate` = reentrega já processada; `unknown_charge` = cobrança não é nossa. */
  outcome: "processed" | "duplicate" | "unknown_charge" | "ignored";
}
