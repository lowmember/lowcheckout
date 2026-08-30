export const OFFER_STATUSES = ["active", "archived"] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export interface Offer {
  id: string;
  productId: string;
  name: string;
  priceInCents: number;
  currency: string;
  /** `null` = a página pública usa a imagem do produto. */
  imageUrl: string | null;
  /** `null` = herda o entregável padrão do produto (RF-OFER-02). */
  deliveryUrl: string | null;
  /** Fallback já resolvido (oferta → produto), para o painel não recalcular. */
  resolvedDeliveryUrl: string | null;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}
