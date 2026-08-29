/**
 * Contrato da página pública: um vínculo checkout+oferta resolvido por slug.
 *
 * TODO(contrato): confirmar `GET /public/checkouts/{slug}`. A página precisa
 * de checkout, produto e oferta numa única resposta — sem sessão, não dá para
 * navegar pelos endpoints do painel.
 */
export interface PublicCheckout {
  checkoutId: string;
  publicSlug: string;
  displayName: string;
  bannerDesktopUrl: string | null;
  bannerMobileUrl: string | null;
  customization: Record<string, unknown>;
  product: {
    name: string;
    description: string | null;
    imageUrl: string | null;
  };
  offer: {
    id: string;
    name: string;
    priceInCents: number;
    currency: string;
  };
}

export type PixOrderStatus = "awaiting_payment" | "paid" | "expired" | "canceled";

/** TODO(contrato): confirmar `POST /public/checkouts/{slug}/orders`. */
export interface PixOrder {
  orderId: string;
  status: PixOrderStatus;
  amountInCents: number;
  currency: string;
  /** Código copia-e-cola do PIX. */
  qrCode: string;
  qrCodeImageUrl: string | null;
  expiresAt: string | null;
}

export interface CreatePixOrderInput {
  buyerName: string;
  buyerEmail: string;
  /** Só dígitos. */
  buyerDocument: string;
}
