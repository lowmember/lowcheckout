import { toAccountDto } from "@/application/accounts/mappers/account.mapper";
import type { MeDto } from "@/application/auth/dtos/me.dto";
import type { UseCase } from "@/application/shared/use-case";
import { toUserDto } from "@/application/users/mappers/user.mapper";
import { AccountNotFoundError } from "@/domain/accounts/errors/account-not-found.error";
import type { AccountsRepository } from "@/domain/accounts/repositories/accounts.repository";
import { UserNotFoundError } from "@/domain/users/errors/user-not-found.error";
import type { UsersRepository } from "@/domain/users/repositories/users.repository";

export interface GetMeInput {
  accountId: string;
  userId: string;
}

export type GetMeUseCase = UseCase<GetMeInput, MeDto>;

/**
 * Não passa pelo guarda de conta: é justamente esta rota que conta ao frontend
 * que o onboarding está pendente (RF-ONB-01) ou que a conta foi desativada
 * (RF-CONF-03).
 */
export class DefaultGetMeUseCase implements GetMeUseCase {
  private readonly usersRepository: UsersRepository;
  private readonly accountsRepository: AccountsRepository;

  constructor(usersRepository: UsersRepository, accountsRepository: AccountsRepository) {
    this.usersRepository = usersRepository;
    this.accountsRepository = accountsRepository;
  }

  async execute({ accountId, userId }: GetMeInput): Promise<MeDto> {
    const user = await this.usersRepository.findById(userId);

    // Um token cuja conta não bate com a do usuário não descreve ninguém.
    if (!user || user.ownerAccountId !== accountId) {
      throw new UserNotFoundError(userId);
    }

    const account = await this.accountsRepository.findById(accountId);

    if (!account) {
      throw new AccountNotFoundError(accountId);
    }

    return {
      user: toUserDto(user),
      account: toAccountDto(account),
      onboardingPending: account.isOnboardingPending,
    };
  }
}
