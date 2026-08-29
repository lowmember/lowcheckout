import type {
  GetSalesSeriesInput,
  GetSalesSeriesUseCase,
} from "@/application/analytics/use-cases/get-sales-series.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class GetSalesSeriesController implements Controller {
  private readonly getSalesSeriesUseCase: GetSalesSeriesUseCase;
  private readonly validator: Validator<Omit<GetSalesSeriesInput, "accountId">>;

  constructor(
    getSalesSeriesUseCase: GetSalesSeriesUseCase,
    validator: Validator<Omit<GetSalesSeriesInput, "accountId">>,
  ) {
    this.getSalesSeriesUseCase = getSalesSeriesUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.query);

    return ok(await this.getSalesSeriesUseCase.execute({ ...input, accountId }));
  }
}
