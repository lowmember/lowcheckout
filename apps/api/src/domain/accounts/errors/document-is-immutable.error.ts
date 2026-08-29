import { OperationNotAllowedError } from "@/domain/shared/errors/domain.error";

/** RF-CONF-02: o documento definido no onboarding é imutável pela interface. */
export class DocumentIsImmutableError extends OperationNotAllowedError {
  override readonly code = "document_is_immutable";

  constructor() {
    super("O CPF/CNPJ não pode ser alterado. Entre em contato com a equipe para corrigi-lo");
  }
}
