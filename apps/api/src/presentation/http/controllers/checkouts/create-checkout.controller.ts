import type {
  CreateCheckoutInput,
  CreateCheckoutUseCase,
} from "@/application/checkouts/use-cases/create-checkout.usecase";
import { created } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class CreateCheckoutController implements Controller {
  private readonly createCheckoutUseCase: CreateCheckoutUseCase;
  private readonly validator: Validator<Omit<CreateCheckoutInput, "accountId">>;

  constructor(
    createCheckoutUseCase: CreateCheckoutUseCase,
    validator: Validator<Omit<CreateCheckoutInput, "accountId">>,
  ) {
    this.createCheckoutUseCase = createCheckoutUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.body);

    return created(await this.createCheckoutUseCase.execute({ ...input, accountId }));
  }
}
