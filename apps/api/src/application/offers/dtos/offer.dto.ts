import type { OfferStatus } from "@/domain/offers/value-objects/offer-status";

/** Contrato de saída dos casos de uso — só primitivos, nunca a entidade. */
export interface OfferDto {
  id: string;
  productId: string;
  name: string;
  priceInCents: number;
  currency: string;
  /** `null` = herda o entregável padrão do produto (RF-OFER-02). */
  deliveryUrl: string | null;
  /** Fallback já resolvido (oferta → produto), para o painel não ter que recalcular. */
  resolvedDeliveryUrl: string | null;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}
