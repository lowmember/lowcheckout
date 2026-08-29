import type {
  CreateOfferInput,
  CreateOfferUseCase,
} from "@/application/offers/use-cases/create-offer.usecase";
import { created } from "@/presentation/http/helpers/http-responses";
import { mergeBodyAndParams } from "@/presentation/http/helpers/merge-body-and-params";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class CreateOfferController implements Controller {
  private readonly createOfferUseCase: CreateOfferUseCase;
  private readonly validator: Validator<Omit<CreateOfferInput, "accountId">>;

  constructor(
    createOfferUseCase: CreateOfferUseCase,
    validator: Validator<Omit<CreateOfferInput, "accountId">>,
  ) {
    this.createOfferUseCase = createOfferUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(mergeBodyAndParams(request));

    return created(await this.createOfferUseCase.execute({ ...input, accountId }));
  }
}
