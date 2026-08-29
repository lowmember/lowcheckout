import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/**
 * Invariante (c): a oferta precisa resolver um entregável em algum dos dois
 * níveis — o dela própria ou o padrão do produto (RF-OFER-02).
 */
export class DeliverableRequiredError extends InvariantViolationError {
  override readonly code = "deliverable_required";

  constructor() {
    super(
      "Informe a URL do entregável na oferta ou cadastre uma URL de entregável padrão no produto",
    );
  }
}
