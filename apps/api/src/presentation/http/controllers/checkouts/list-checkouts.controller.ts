import type {
  ListCheckoutsInput,
  ListCheckoutsUseCase,
} from "@/application/checkouts/use-cases/list-checkouts.usecase";
import { okPage } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class ListCheckoutsController implements Controller {
  private readonly listCheckoutsUseCase: ListCheckoutsUseCase;
  private readonly validator: Validator<Omit<ListCheckoutsInput, "accountId">>;

  constructor(
    listCheckoutsUseCase: ListCheckoutsUseCase,
    validator: Validator<Omit<ListCheckoutsInput, "accountId">>,
  ) {
    this.listCheckoutsUseCase = listCheckoutsUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.query);

    return okPage(await this.listCheckoutsUseCase.execute({ ...input, accountId }));
  }
}
