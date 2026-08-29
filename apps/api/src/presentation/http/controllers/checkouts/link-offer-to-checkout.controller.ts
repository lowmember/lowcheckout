import type {
  LinkOfferToCheckoutInput,
  LinkOfferToCheckoutUseCase,
} from "@/application/checkouts/use-cases/link-offer-to-checkout.usecase";
import { created } from "@/presentation/http/helpers/http-responses";
import { mergeBodyAndParams } from "@/presentation/http/helpers/merge-body-and-params";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class LinkOfferToCheckoutController implements Controller {
  private readonly linkOfferToCheckoutUseCase: LinkOfferToCheckoutUseCase;
  private readonly validator: Validator<Omit<LinkOfferToCheckoutInput, "accountId">>;

  constructor(
    linkOfferToCheckoutUseCase: LinkOfferToCheckoutUseCase,
    validator: Validator<Omit<LinkOfferToCheckoutInput, "accountId">>,
  ) {
    this.linkOfferToCheckoutUseCase = linkOfferToCheckoutUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(mergeBodyAndParams(request));

    return created(await this.linkOfferToCheckoutUseCase.execute({ ...input, accountId }));
  }
}
