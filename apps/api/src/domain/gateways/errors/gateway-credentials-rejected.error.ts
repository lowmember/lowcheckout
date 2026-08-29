import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/** RF-GTW-05: o provedor recusou as credenciais — nada é marcado como conectado. */
export class GatewayCredentialsRejectedError extends InvariantViolationError {
  override readonly code = "gateway_credentials_rejected";

  constructor(detail?: string) {
    super(
      detail
        ? `O provedor recusou as credenciais informadas: ${detail}`
        : "O provedor recusou as credenciais informadas",
    );
  }
}
