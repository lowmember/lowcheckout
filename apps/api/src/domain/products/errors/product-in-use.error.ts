import { ConflictError } from "@/domain/shared/errors/domain.error";

/**
 * Deletar o produto arrastaria ofertas e checkouts junto — e com eles o
 * histórico de pedidos que aponta para as ofertas. Por isso a dependência é
 * verificada antes: o vínculo é desfeito no painel, nunca por efeito colateral.
 */
export class ProductInUseError extends ConflictError {
  override readonly code = "product_in_use";

  constructor(dependentOffers: number, dependentCheckouts: number) {
    super(
      `Não é possível deletar o produto: ${dependentOffers} oferta(s) e ${dependentCheckouts} checkout(s) ainda dependem dele. Delete os checkouts e as ofertas antes`,
    );
  }
}
