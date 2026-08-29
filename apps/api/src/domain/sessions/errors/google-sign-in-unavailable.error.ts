import { ServiceUnavailableError } from "@/domain/shared/errors/domain.error";

/** O ambiente não tem o OAuth do Google configurado: login indisponível, não inválido. */
export class GoogleSignInUnavailableError extends ServiceUnavailableError {
  override readonly code = "google_sign_in_unavailable";

  constructor() {
    super("O login com Google não está disponível neste ambiente");
  }
}
