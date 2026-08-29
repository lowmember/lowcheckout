import { DefaultCompleteOnboardingUseCase } from "@/application/accounts/use-cases/complete-onboarding.usecase";
import { DefaultDeactivateAccountUseCase } from "@/application/accounts/use-cases/deactivate-account.usecase";
import { DefaultDeleteAccountUseCase } from "@/application/accounts/use-cases/delete-account.usecase";
import { DefaultUpdateAccountUseCase } from "@/application/accounts/use-cases/update-account.usecase";
import { getContainer } from "@/infra/di/container";
import { withPanelAccess } from "@/infra/di/factories/with-account-guard";
import { withErrorHandling } from "@/infra/di/factories/with-error-handling";
import {
  completeOnboardingSchema,
  updateAccountSchema,
} from "@/infra/validation/zod/schemas/account.schemas";
import { ZodValidator } from "@/infra/validation/zod/zod-validator.adapter";
import { CompleteOnboardingController } from "@/presentation/http/controllers/accounts/complete-onboarding.controller";
import { DeactivateAccountController } from "@/presentation/http/controllers/accounts/deactivate-account.controller";
import { DeleteAccountController } from "@/presentation/http/controllers/accounts/delete-account.controller";
import { UpdateAccountController } from "@/presentation/http/controllers/accounts/update-account.controller";

export function makeCompleteOnboardingController() {
  const { accountsRepository, clock } = getContainer();

  // Guarda de painel, não de escrita: o onboarding é exatamente o que falta aqui.
  return withErrorHandling(
    new CompleteOnboardingController(
      withPanelAccess(new DefaultCompleteOnboardingUseCase(accountsRepository, clock)),
      new ZodValidator(completeOnboardingSchema),
    ),
  );
}

export function makeUpdateAccountController() {
  const { accountsRepository, usersRepository, clock } = getContainer();

  return withErrorHandling(
    new UpdateAccountController(
      withPanelAccess(new DefaultUpdateAccountUseCase(accountsRepository, usersRepository, clock)),
      new ZodValidator(updateAccountSchema),
    ),
  );
}

export function makeDeactivateAccountController() {
  const { accountsRepository, refreshTokensRepository, clock } = getContainer();

  return withErrorHandling(
    new DeactivateAccountController(
      withPanelAccess(
        new DefaultDeactivateAccountUseCase(accountsRepository, refreshTokensRepository, clock),
      ),
    ),
  );
}

export function makeDeleteAccountController() {
  const { accountsRepository, refreshTokensRepository, clock } = getContainer();

  return withErrorHandling(
    new DeleteAccountController(
      withPanelAccess(
        new DefaultDeleteAccountUseCase(accountsRepository, refreshTokensRepository, clock),
      ),
    ),
  );
}
