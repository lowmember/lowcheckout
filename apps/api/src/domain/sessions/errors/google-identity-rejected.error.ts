import { AuthenticationFailedError } from "@/domain/shared/errors/domain.error";

/** Id token do Google inválido: assinatura, emissor, `aud` ou validade. */
export class GoogleIdentityRejectedError extends AuthenticationFailedError {
  override readonly code = "google_identity_rejected";

  constructor() {
    super("Não foi possível validar o acesso com o Google. Tente entrar novamente");
  }
}
