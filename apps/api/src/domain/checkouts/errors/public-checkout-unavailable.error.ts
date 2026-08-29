import { EntityNotFoundError } from "@/domain/shared/errors/domain.error";

/**
 * RF-PUB-01: URL desvinculada, checkout inexistente ou conta indisponível
 * respondem a mesma coisa. A mensagem é única de propósito — distinguir os
 * casos vazaria a existência de recursos de outra conta.
 */
export class PublicCheckoutUnavailableError extends EntityNotFoundError {
  override readonly code = "public_checkout_unavailable";

  constructor() {
    super("Esta página de checkout não está disponível");
  }
}
