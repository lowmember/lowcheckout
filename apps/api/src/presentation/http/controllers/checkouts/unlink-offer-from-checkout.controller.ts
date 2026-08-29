import type {
  UnlinkOfferFromCheckoutInput,
  UnlinkOfferFromCheckoutUseCase,
} from "@/application/checkouts/use-cases/unlink-offer-from-checkout.usecase";
import { noContent } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class UnlinkOfferFromCheckoutController implements Controller {
  private readonly unlinkOfferFromCheckoutUseCase: UnlinkOfferFromCheckoutUseCase;
  private readonly validator: Validator<Omit<UnlinkOfferFromCheckoutInput, "accountId">>;

  constructor(
    unlinkOfferFromCheckoutUseCase: UnlinkOfferFromCheckoutUseCase,
    validator: Validator<Omit<UnlinkOfferFromCheckoutInput, "accountId">>,
  ) {
    this.unlinkOfferFromCheckoutUseCase = unlinkOfferFromCheckoutUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.params);

    await this.unlinkOfferFromCheckoutUseCase.execute({ ...input, accountId });

    return noContent();
  }
}
