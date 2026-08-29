import type {
  GetTopCheckoutsInput,
  GetTopCheckoutsUseCase,
} from "@/application/analytics/use-cases/get-top-checkouts.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class GetTopCheckoutsController implements Controller {
  private readonly getTopCheckoutsUseCase: GetTopCheckoutsUseCase;
  private readonly validator: Validator<Omit<GetTopCheckoutsInput, "accountId">>;

  constructor(
    getTopCheckoutsUseCase: GetTopCheckoutsUseCase,
    validator: Validator<Omit<GetTopCheckoutsInput, "accountId">>,
  ) {
    this.getTopCheckoutsUseCase = getTopCheckoutsUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.query);

    return ok(await this.getTopCheckoutsUseCase.execute({ ...input, accountId }));
  }
}
