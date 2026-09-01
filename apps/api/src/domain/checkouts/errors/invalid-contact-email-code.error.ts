import { OperationNotAllowedError } from "@/domain/shared/errors/domain.error";

/** Código errado ou já vencido — a mensagem não distingue os dois de propósito. */
export class InvalidContactEmailCodeError extends OperationNotAllowedError {
  override readonly code = "invalid_contact_email_code";

  constructor() {
    super("Código de confirmação inválido ou expirado. Peça um novo código");
  }
}
