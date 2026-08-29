import type {
  GetAnalyticsOverviewInput,
  GetAnalyticsOverviewUseCase,
} from "@/application/analytics/use-cases/get-analytics-overview.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class GetAnalyticsOverviewController implements Controller {
  private readonly getAnalyticsOverviewUseCase: GetAnalyticsOverviewUseCase;
  private readonly validator: Validator<Omit<GetAnalyticsOverviewInput, "accountId">>;

  constructor(
    getAnalyticsOverviewUseCase: GetAnalyticsOverviewUseCase,
    validator: Validator<Omit<GetAnalyticsOverviewInput, "accountId">>,
  ) {
    this.getAnalyticsOverviewUseCase = getAnalyticsOverviewUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.query);

    return ok(await this.getAnalyticsOverviewUseCase.execute({ ...input, accountId }));
  }
}
