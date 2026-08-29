import type {
  UpdateCheckoutInput,
  UpdateCheckoutUseCase,
} from "@/application/checkouts/use-cases/update-checkout.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { mergeBodyAndParams } from "@/presentation/http/helpers/merge-body-and-params";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class UpdateCheckoutController implements Controller {
  private readonly updateCheckoutUseCase: UpdateCheckoutUseCase;
  private readonly validator: Validator<Omit<UpdateCheckoutInput, "accountId">>;

  constructor(
    updateCheckoutUseCase: UpdateCheckoutUseCase,
    validator: Validator<Omit<UpdateCheckoutInput, "accountId">>,
  ) {
    this.updateCheckoutUseCase = updateCheckoutUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(mergeBodyAndParams(request));

    return ok(await this.updateCheckoutUseCase.execute({ ...input, accountId }));
  }
}
