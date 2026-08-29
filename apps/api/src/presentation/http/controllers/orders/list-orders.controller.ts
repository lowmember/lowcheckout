import type {
  ListOrdersInput,
  ListOrdersUseCase,
} from "@/application/orders/use-cases/list-orders.usecase";
import { okPage } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class ListOrdersController implements Controller {
  private readonly listOrdersUseCase: ListOrdersUseCase;
  private readonly validator: Validator<Omit<ListOrdersInput, "accountId">>;

  constructor(
    listOrdersUseCase: ListOrdersUseCase,
    validator: Validator<Omit<ListOrdersInput, "accountId">>,
  ) {
    this.listOrdersUseCase = listOrdersUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.query);

    return okPage(await this.listOrdersUseCase.execute({ ...input, accountId }));
  }
}
