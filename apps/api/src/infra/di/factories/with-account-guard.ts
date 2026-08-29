import { AccountGuardedUseCase } from "@/application/accounts/use-cases/account-guarded.usecase";
import type { UseCase } from "@/application/shared/use-case";
import { getContainer } from "@/infra/di/container";

/**
 * Leitura do painel: recusa conta desativada ou excluída, mas deixa passar
 * quem ainda está em onboarding — senão o painel não teria como se desenhar.
 */
export function withPanelAccess<TInput extends { accountId: string }, TOutput>(
  useCase: UseCase<TInput, TOutput>,
): UseCase<TInput, TOutput> {
  return new AccountGuardedUseCase(useCase, getContainer().accountsRepository, false);
}

/** Escrita no painel: o onboarding é bloqueante (RF-ONB-01). */
export function withOnboardedAccount<TInput extends { accountId: string }, TOutput>(
  useCase: UseCase<TInput, TOutput>,
): UseCase<TInput, TOutput> {
  return new AccountGuardedUseCase(useCase, getContainer().accountsRepository, true);
}
