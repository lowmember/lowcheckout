import type {
  ReplaceCheckoutPixelsInput,
  ReplaceCheckoutPixelsUseCase,
} from "@/application/checkouts/use-cases/replace-checkout-pixels.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { mergeBodyAndParams } from "@/presentation/http/helpers/merge-body-and-params";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class ReplaceCheckoutPixelsController implements Controller {
  private readonly replaceCheckoutPixelsUseCase: ReplaceCheckoutPixelsUseCase;
  private readonly validator: Validator<Omit<ReplaceCheckoutPixelsInput, "accountId">>;

  constructor(
    replaceCheckoutPixelsUseCase: ReplaceCheckoutPixelsUseCase,
    validator: Validator<Omit<ReplaceCheckoutPixelsInput, "accountId">>,
  ) {
    this.replaceCheckoutPixelsUseCase = replaceCheckoutPixelsUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(mergeBodyAndParams(request));

    return ok(await this.replaceCheckoutPixelsUseCase.execute({ ...input, accountId }));
  }
}
