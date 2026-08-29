import type {
  ListOffersInput,
  ListOffersUseCase,
} from "@/application/offers/use-cases/list-offers.usecase";
import { okPage } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class ListOffersController implements Controller {
  private readonly listOffersUseCase: ListOffersUseCase;
  private readonly validator: Validator<Omit<ListOffersInput, "accountId">>;

  constructor(
    listOffersUseCase: ListOffersUseCase,
    validator: Validator<Omit<ListOffersInput, "accountId">>,
  ) {
    this.listOffersUseCase = listOffersUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate({ ...request.query, ...request.params });

    return okPage(await this.listOffersUseCase.execute({ ...input, accountId }));
  }
}
