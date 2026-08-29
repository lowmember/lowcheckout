import { DeliverableRequiredError } from "@/domain/offers/errors/deliverable-required.error";

/**
 * Metade "no salvamento da oferta" da invariante (c). Cruza dois agregados
 * (oferta e produto), por isso vive numa policy do domínio e é chamada pelos
 * casos de uso de oferta — não pela entidade `Offer`, que não conhece o produto.
 */
export function assertDeliverableIsResolvable(
  offerDeliveryUrl: string | null,
  productDefaultDeliveryUrl: string | null,
): void {
  if (offerDeliveryUrl === null && productDefaultDeliveryUrl === null) {
    throw new DeliverableRequiredError();
  }
}

/** Resolução do fallback oferta → produto (RF-OFER-02); congelada no pedido (RF-PAG-06). */
export function resolveDeliveryUrl(
  offerDeliveryUrl: string | null,
  productDefaultDeliveryUrl: string | null,
): string | null {
  return offerDeliveryUrl ?? productDefaultDeliveryUrl;
}
