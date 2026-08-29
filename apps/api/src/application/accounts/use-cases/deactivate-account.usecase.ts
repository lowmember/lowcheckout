import type { AccountDto } from "@/application/accounts/dtos/account.dto";
import { toAccountDto } from "@/application/accounts/mappers/account.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import { AccountNotFoundError } from "@/domain/accounts/errors/account-not-found.error";
import type { AccountsRepository } from "@/domain/accounts/repositories/accounts.repository";
import type { RefreshTokensRepository } from "@/domain/sessions/repositories/refresh-tokens.repository";

export interface DeactivateAccountInput {
  accountId: string;
  userId: string;
}

export type DeactivateAccountUseCase = UseCase<DeactivateAccountInput, AccountDto>;

/**
 * RF-CONF-03: suspende vendas e acesso sem apagar dado nenhum. Pedidos
 * pendentes continuam seguindo para confirmação ou expiração — nada aqui os
 * toca. As sessões vivas são encerradas.
 */
export class DefaultDeactivateAccountUseCase implements DeactivateAccountUseCase {
  private readonly accountsRepository: AccountsRepository;
  private readonly refreshTokensRepository: RefreshTokensRepository;
  private readonly clock: Clock;

  constructor(
    accountsRepository: AccountsRepository,
    refreshTokensRepository: RefreshTokensRepository,
    clock: Clock,
  ) {
    this.accountsRepository = accountsRepository;
    this.refreshTokensRepository = refreshTokensRepository;
    this.clock = clock;
  }

  async execute({ accountId, userId }: DeactivateAccountInput): Promise<AccountDto> {
    const account = await this.accountsRepository.findById(accountId);

    if (!account) {
      throw new AccountNotFoundError(accountId);
    }

    const now = this.clock.now();

    account.deactivate(now);

    await this.accountsRepository.update(account);
    await this.refreshTokensRepository.revokeAllForUser(userId, now);

    return toAccountDto(account);
  }
}
