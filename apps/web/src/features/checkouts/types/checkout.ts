import type { Offer } from "@/features/offers";

export type CheckoutStatus = "draft" | "active" | "paused" | "archived";

export interface Checkout {
  id: string;
  productId: string;
  internalTitle: string;
  displayName: string;
  bannerDesktopUrl: string | null;
  bannerMobileUrl: string | null;
  customization: Record<string, unknown>;
  status: CheckoutStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * A listagem devolve o mesmo `CheckoutDto` do detalhe — sem nome do produto nem
 * contagem de ofertas. O nome do produto é resolvido no cliente pela lista de
 * produtos, que a tela já carrega.
 */
export type CheckoutListItem = Checkout;

export interface ListCheckoutsParams {
  page?: number;
  perPage?: number;
  status?: CheckoutStatus;
  search?: string;
}

export interface CreateCheckoutInput {
  productId: string;
  internalTitle: string;
  displayName: string;
  bannerDesktopUrl?: string | null;
  bannerMobileUrl?: string | null;
}

export interface UpdateCheckoutInput extends Partial<Omit<CreateCheckoutInput, "productId">> {
  status?: CheckoutStatus;
}

/** Vínculo checkout ↔ oferta. Cada vínculo tem exatamente 1 URL pública (RF-CHK-05). */
export interface CheckoutOffer {
  id: string;
  checkoutId: string;
  offerId: string;
  productId: string;
  publicSlug: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** `GET /checkouts/{id}/offers` embute a oferta inteira no vínculo (RF-CHK-06). */
export interface CheckoutOfferListItem extends CheckoutOffer {
  offer: Offer;
}

export type PixelProvider = "facebook" | "utmify";

/**
 * O token **nunca** volta da API — só a informação de que existe um gravado.
 * Devolvê-lo desfaria o motivo de guardá-lo cifrado.
 */
export interface CheckoutPixel {
  id: string;
  checkoutId: string;
  provider: PixelProvider;
  externalId: string;
  hasAccessToken: boolean;
  config: Record<string, unknown>;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Escrita: a lista enviada substitui o conjunto: provider ausente é removido. */
export interface CheckoutPixelInput {
  provider: PixelProvider;
  externalId: string;
  /** `null` mantém o token atual; string nova o substitui. */
  accessToken?: string | null;
  isEnabled?: boolean;
}

export type CheckoutFieldErrors = Partial<
  Record<
    "productId" | "internalTitle" | "displayName" | "bannerDesktopUrl" | "bannerMobileUrl",
    string
  >
>;
