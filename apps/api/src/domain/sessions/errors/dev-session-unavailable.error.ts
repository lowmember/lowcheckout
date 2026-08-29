import { EntityNotFoundError } from "@/domain/shared/errors/domain.error";

/**
 * A sessão de desenvolvimento não existe em produção. Responde **404**, e não
 * 403, de propósito: 403 anunciaria que a rota existe e está apenas fechada.
 * A mensagem é genérica pelo mesmo motivo.
 */
export class DevSessionUnavailableError extends EntityNotFoundError {
  override readonly code = "not_found";

  constructor() {
    super("Recurso não encontrado");
  }
}
