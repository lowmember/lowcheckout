import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/**
 * Metade "à distância" da invariante (c): limpar o entregável padrão do produto
 * invalidaria as ofertas ativas que dependem dele por fallback (RF-OFER-02).
 */
export class ProductDeliveryUrlInUseError extends InvariantViolationError {
  override readonly code = "product_delivery_url_in_use";

  constructor(dependentOffers: number) {
    super(
      `Não é possível remover a URL do entregável padrão: ${dependentOffers} oferta(s) ativa(s) dependem dela. Informe o entregável em cada oferta antes de limpar o padrão do produto`,
    );
  }
}
