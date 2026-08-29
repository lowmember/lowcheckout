import type {
  GetOfferInput,
  GetOfferUseCase,
} from "@/application/offers/use-cases/get-offer.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class GetOfferController implements Controller {
  private readonly getOfferUseCase: GetOfferUseCase;
  private readonly validator: Validator<Omit<GetOfferInput, "accountId">>;

  constructor(
    getOfferUseCase: GetOfferUseCase,
    validator: Validator<Omit<GetOfferInput, "accountId">>,
  ) {
    this.getOfferUseCase = getOfferUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.params);

    return ok(await this.getOfferUseCase.execute({ ...input, accountId }));
  }
}
