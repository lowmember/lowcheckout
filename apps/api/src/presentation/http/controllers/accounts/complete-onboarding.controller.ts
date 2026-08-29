import type {
  CompleteOnboardingInput,
  CompleteOnboardingUseCase,
} from "@/application/accounts/use-cases/complete-onboarding.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class CompleteOnboardingController implements Controller {
  private readonly completeOnboardingUseCase: CompleteOnboardingUseCase;
  private readonly validator: Validator<Omit<CompleteOnboardingInput, "accountId">>;

  constructor(
    completeOnboardingUseCase: CompleteOnboardingUseCase,
    validator: Validator<Omit<CompleteOnboardingInput, "accountId">>,
  ) {
    this.completeOnboardingUseCase = completeOnboardingUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.body);

    return ok(await this.completeOnboardingUseCase.execute({ ...input, accountId }));
  }
}
