import type { UseCase } from "@/application/shared/use-case";
import { AccountNotFoundError } from "@/domain/accounts/errors/account-not-found.error";
import type { AccountsRepository } from "@/domain/accounts/repositories/accounts.repository";

/**
 * Aplica o estado da conta antes de qualquer caso de uso multi-tenant, sem que
 * cada um deles precise conhecer `AccountsRepository`:
 *
 * - `requireOnboardingCompleted: false` — leitura do painel: basta a conta não
 *   estar desativada nem excluída;
 * - `requireOnboardingCompleted: true` — escrita: o onboarding é bloqueante
 *   (RF-ONB-01), então criar produto, oferta, checkout ou conectar gateway é
 *   recusado enquanto ele estiver pendente.
 *
 * Fica na `application/` porque a regra é de orquestração entre agregados; quem
 * decide qual caso de uso recebe qual nível é o composition root.
 */
export class AccountGuardedUseCase<TInput extends { accountId: string }, TOutput>
  implements UseCase<TInput, TOutput>
{
  private readonly useCase: UseCase<TInput, TOutput>;
  private readonly accountsRepository: AccountsRepository;
  private readonly requireOnboardingCompleted: boolean;

  constructor(
    useCase: UseCase<TInput, TOutput>,
    accountsRepository: AccountsRepository,
    requireOnboardingCompleted: boolean,
  ) {
    this.useCase = useCase;
    this.accountsRepository = accountsRepository;
    this.requireOnboardingCompleted = requireOnboardingCompleted;
  }

  async execute(input: TInput): Promise<TOutput> {
    const account = await this.accountsRepository.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundError(input.accountId);
    }

    if (this.requireOnboardingCompleted) {
      account.assertCanOperate();
    } else {
      account.assertCanAccessPanel();
    }

    return this.useCase.execute(input);
  }
}
