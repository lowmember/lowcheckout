import type {
  ListCheckoutOffersInput,
  ListCheckoutOffersUseCase,
} from "@/application/checkouts/use-cases/list-checkout-offers.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class ListCheckoutOffersController implements Controller {
  private readonly listCheckoutOffersUseCase: ListCheckoutOffersUseCase;
  private readonly validator: Validator<Omit<ListCheckoutOffersInput, "accountId">>;

  constructor(
    listCheckoutOffersUseCase: ListCheckoutOffersUseCase,
    validator: Validator<Omit<ListCheckoutOffersInput, "accountId">>,
  ) {
    this.listCheckoutOffersUseCase = listCheckoutOffersUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.params);

    return ok(await this.listCheckoutOffersUseCase.execute({ ...input, accountId }));
  }
}
