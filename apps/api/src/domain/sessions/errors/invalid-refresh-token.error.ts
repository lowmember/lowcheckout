import { AuthenticationFailedError } from "@/domain/shared/errors/domain.error";

/**
 * Refresh token inexistente, expirado ou já revogado. Mensagem única de
 * propósito: distinguir os três casos entregaria informação a quem está
 * tentando adivinhar tokens.
 */
export class InvalidRefreshTokenError extends AuthenticationFailedError {
  override readonly code = "invalid_refresh_token";

  constructor() {
    super("Sessão expirada. Entre novamente");
  }
}
