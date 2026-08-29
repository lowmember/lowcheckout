import { ConflictError } from "@/domain/shared/errors/domain.error";

/** RF-ONB-02: o documento é único por conta. */
export class DocumentAlreadyInUseError extends ConflictError {
  override readonly code = "document_already_in_use";

  constructor() {
    super("Este CPF/CNPJ já está cadastrado em outra conta");
  }
}
