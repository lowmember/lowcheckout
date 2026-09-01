import { EntityNotFoundError } from "@/domain/shared/errors/domain.error";

export class ContactEmailVerificationNotFoundError extends EntityNotFoundError {
  override readonly code = "contact_email_verification_not_found";

  constructor() {
    super("Nenhum código de confirmação em aberto para este checkout");
  }
}
