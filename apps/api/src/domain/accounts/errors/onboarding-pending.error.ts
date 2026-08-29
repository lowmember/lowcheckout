import { OperationNotAllowedError } from "@/domain/shared/errors/domain.error";

/** RF-ONB-01: o onboarding é bloqueante — nada é criado antes de concluí-lo. */
export class OnboardingPendingError extends OperationNotAllowedError {
  override readonly code = "onboarding_pending";

  constructor() {
    super("Conclua o onboarding da conta antes de executar esta ação");
  }
}
