import type {
  DeleteOfferInput,
  DeleteOfferUseCase,
} from "@/application/offers/use-cases/delete-offer.usecase";
import { noContent } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class DeleteOfferController implements Controller {
  private readonly deleteOfferUseCase: DeleteOfferUseCase;
  private readonly validator: Validator<Omit<DeleteOfferInput, "accountId">>;

  constructor(
    deleteOfferUseCase: DeleteOfferUseCase,
    validator: Validator<Omit<DeleteOfferInput, "accountId">>,
  ) {
    this.deleteOfferUseCase = deleteOfferUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.params);

    await this.deleteOfferUseCase.execute({ ...input, accountId });

    return noContent();
  }
}
