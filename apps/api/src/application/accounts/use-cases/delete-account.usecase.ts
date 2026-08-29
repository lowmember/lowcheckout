import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import { AccountNotFoundError } from "@/domain/accounts/errors/account-not-found.error";
import type { AccountsRepository } from "@/domain/accounts/repositories/accounts.repository";
import type { RefreshTokensRepository } from "@/domain/sessions/repositories/refresh-tokens.repository";

export interface DeleteAccountInput {
  accountId: string;
  userId: string;
}

export type DeleteAccountUseCase = UseCase<DeleteAccountInput, void>;

/**
 * RF-CONF-04: exclusão **lógica**. `status = deleted` + `deleted_at` tornam a
 * conta inacessível e derrubam as páginas públicas, sem destruir o histórico
 * financeiro — a anonimização dos dados pessoais do comprador é um passo
 * separado, com prazo de retenção ainda a definir (S24).
 */
export class DefaultDeleteAccountUseCase implements DeleteAccountUseCase {
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

  async execute({ accountId, userId }: DeleteAccountInput): Promise<void> {
    const account = await this.accountsRepository.findById(accountId);

    if (!account) {
      throw new AccountNotFoundError(accountId);
    }

    const now = this.clock.now();

    account.markAsDeleted(now);

    await this.accountsRepository.update(account);
    await this.refreshTokensRepository.revokeAllForUser(userId, now);
  }
}
