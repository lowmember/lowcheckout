import type {
  GetCheckoutInput,
  GetCheckoutUseCase,
} from "@/application/checkouts/use-cases/get-checkout.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class GetCheckoutController implements Controller {
  private readonly getCheckoutUseCase: GetCheckoutUseCase;
  private readonly validator: Validator<Omit<GetCheckoutInput, "accountId">>;

  constructor(
    getCheckoutUseCase: GetCheckoutUseCase,
    validator: Validator<Omit<GetCheckoutInput, "accountId">>,
  ) {
    this.getCheckoutUseCase = getCheckoutUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.params);

    return ok(await this.getCheckoutUseCase.execute({ ...input, accountId }));
  }
}
