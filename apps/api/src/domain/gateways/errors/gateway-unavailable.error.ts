import { ServiceUnavailableError } from "@/domain/shared/errors/domain.error";

/**
 * RF-GTW-05: falha de comunicação com o provedor. É diferente de credencial
 * recusada — aqui o usuário deve simplesmente tentar de novo.
 */
export class GatewayUnavailableError extends ServiceUnavailableError {
  override readonly code = "gateway_unavailable";

  constructor(detail?: string) {
    super(
      detail
        ? `Não foi possível falar com o provedor de pagamento: ${detail}`
        : "Não foi possível falar com o provedor de pagamento. Tente novamente em instantes",
    );
  }
}
