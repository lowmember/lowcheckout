import { ConflictError } from "@/domain/shared/errors/domain.error";

/**
 * A conta não tem gateway conectado, então não há como cobrar (RF-GTW-03).
 * Mensagem escrita para o **comprador**: é ele quem topa com isso na página
 * pública, e a falha não é dele.
 */
export class GatewayNotConnectedError extends ConflictError {
  override readonly code = "gateway_not_connected";

  constructor() {
    super("Esta loja ainda não está pronta para receber pagamentos");
  }
}
