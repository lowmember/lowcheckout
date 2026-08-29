import type { AccountDto } from "@/application/accounts/dtos/account.dto";
import { toAccountDto } from "@/application/accounts/mappers/account.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import { AccountNotFoundError } from "@/domain/accounts/errors/account-not-found.error";
import type { AccountsRepository } from "@/domain/accounts/repositories/accounts.repository";
import { UserNotFoundError } from "@/domain/users/errors/user-not-found.error";
import type { UsersRepository } from "@/domain/users/repositories/users.repository";

/**
 * RF-CONF-01. `document`/`documentType` não existem aqui de propósito: o
 * documento é imutável (RF-CONF-02) e o schema de entrada recusa a chave.
 */
export interface UpdateAccountInput {
  accountId: string;
  userId: string;
  businessName?: string;
  contactEmail?: string | null;
  /** `users.name`, que o modelo de dados marca como editável em Configurações. */
  userName?: string;
}

export type UpdateAccountUseCase = UseCase<UpdateAccountInput, AccountDto>;

export class DefaultUpdateAccountUseCase implements UpdateAccountUseCase {
  private readonly accountsRepository: AccountsRepository;
  private readonly usersRepository: UsersRepository;
  private readonly clock: Clock;

  constructor(
    accountsRepository: AccountsRepository,
    usersRepository: UsersRepository,
    clock: Clock,
  ) {
    this.accountsRepository = accountsRepository;
    this.usersRepository = usersRepository;
    this.clock = clock;
  }

  async execute(input: UpdateAccountInput): Promise<AccountDto> {
    const account = await this.accountsRepository.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundError(input.accountId);
    }

    const now = this.clock.now();

    if (input.businessName !== undefined) {
      account.renameBusiness(input.businessName, now);
    }

    if (input.contactEmail !== undefined) {
      account.changeContactEmail(input.contactEmail, now);
    }

    await this.accountsRepository.update(account);

    if (input.userName !== undefined) {
      const user = await this.usersRepository.findById(input.userId);

      if (!user || user.ownerAccountId !== input.accountId) {
        throw new UserNotFoundError(input.userId);
      }

      user.rename(input.userName, now);

      await this.usersRepository.update(user);
    }

    return toAccountDto(account);
  }
}
