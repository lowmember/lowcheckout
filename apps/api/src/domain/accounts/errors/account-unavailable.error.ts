import type { AccountStatus } from "@/domain/accounts/value-objects/account-status";
import { OperationNotAllowedError } from "@/domain/shared/errors/domain.error";

/** Conta desativada (RF-CONF-03) ou excluída (RF-CONF-04): sessão válida, conta não. */
export class AccountUnavailableError extends OperationNotAllowedError {
  override readonly code = "account_unavailable";

  constructor(status: AccountStatus) {
    super(
      status === "deleted"
        ? "Esta conta foi excluída"
        : "Esta conta está desativada. Reative-a para voltar a operar",
    );
  }
}
