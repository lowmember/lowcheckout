import { AuthenticationFailedError } from "@/domain/shared/errors/domain.error";

/** RF-AUTH-01: retorno do Google sem e-mail verificado tem o acesso recusado. */
export class GoogleEmailNotVerifiedError extends AuthenticationFailedError {
  override readonly code = "google_email_not_verified";

  constructor() {
    super("O e-mail da sua conta Google não está verificado");
  }
}
