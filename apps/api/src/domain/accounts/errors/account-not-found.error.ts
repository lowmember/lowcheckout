import { EntityNotFoundError } from "@/domain/shared/errors/domain.error";

export class AccountNotFoundError extends EntityNotFoundError {
  override readonly code = "account_not_found";

  constructor(accountId: string) {
    super(`Conta ${accountId} não encontrada`);
  }
}
