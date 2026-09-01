import { ConflictError } from "@/domain/shared/errors/domain.error";

/**
 * Deletar a oferta arrastaria a URL pública e o histórico de pedidos que aponta
 * para ela. Por isso a dependência é verificada antes: o vínculo com o checkout
 * é desfeito no painel, nunca por efeito colateral.
 */
export class OfferInUseError extends ConflictError {
  override readonly code = "offer_in_use";

  constructor(linkedCheckouts: number, orders: number) {
    super(
      orders > 0
        ? `Não é possível deletar a oferta: ${orders} pedido(s) já apontam para ela. Arquive a oferta em vez de deletar`
        : `Não é possível deletar a oferta: ela ainda está vinculada a ${linkedCheckouts} checkout(s). Desvincule-a antes`,
    );
  }
}
