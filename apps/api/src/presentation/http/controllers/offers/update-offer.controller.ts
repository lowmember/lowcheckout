import type {
  UpdateOfferInput,
  UpdateOfferUseCase,
} from "@/application/offers/use-cases/update-offer.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { mergeBodyAndParams } from "@/presentation/http/helpers/merge-body-and-params";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class UpdateOfferController implements Controller {
  private readonly updateOfferUseCase: UpdateOfferUseCase;
  private readonly validator: Validator<Omit<UpdateOfferInput, "accountId">>;

  constructor(
    updateOfferUseCase: UpdateOfferUseCase,
    validator: Validator<Omit<UpdateOfferInput, "accountId">>,
  ) {
    this.updateOfferUseCase = updateOfferUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(mergeBodyAndParams(request));

    return ok(await this.updateOfferUseCase.execute({ ...input, accountId }));
  }
}
