import type {
  ListCheckoutPixelsInput,
  ListCheckoutPixelsUseCase,
} from "@/application/checkouts/use-cases/list-checkout-pixels.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class ListCheckoutPixelsController implements Controller {
  private readonly listCheckoutPixelsUseCase: ListCheckoutPixelsUseCase;
  private readonly validator: Validator<Omit<ListCheckoutPixelsInput, "accountId">>;

  constructor(
    listCheckoutPixelsUseCase: ListCheckoutPixelsUseCase,
    validator: Validator<Omit<ListCheckoutPixelsInput, "accountId">>,
  ) {
    this.listCheckoutPixelsUseCase = listCheckoutPixelsUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.params);

    return ok(await this.listCheckoutPixelsUseCase.execute({ ...input, accountId }));
  }
}
