import type {
  ConfirmCheckoutContactEmailInput,
  ConfirmCheckoutContactEmailUseCase,
} from "@/application/checkouts/use-cases/confirm-checkout-contact-email.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { mergeBodyAndParams } from "@/presentation/http/helpers/merge-body-and-params";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

type Input = Omit<ConfirmCheckoutContactEmailInput, "accountId">;

export class ConfirmCheckoutContactEmailController implements Controller {
  private readonly confirmCheckoutContactEmailUseCase: ConfirmCheckoutContactEmailUseCase;
  private readonly validator: Validator<Input>;

  constructor(
    confirmCheckoutContactEmailUseCase: ConfirmCheckoutContactEmailUseCase,
    validator: Validator<Input>,
  ) {
    this.confirmCheckoutContactEmailUseCase = confirmCheckoutContactEmailUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(mergeBodyAndParams(request));

    return ok(await this.confirmCheckoutContactEmailUseCase.execute({ ...input, accountId }));
  }
}
