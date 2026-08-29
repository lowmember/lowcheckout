import type {
  UpdateCheckoutCustomizationInput,
  UpdateCheckoutCustomizationUseCase,
} from "@/application/checkouts/use-cases/update-checkout-customization.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { mergeBodyAndParams } from "@/presentation/http/helpers/merge-body-and-params";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class UpdateCheckoutCustomizationController implements Controller {
  private readonly updateCheckoutCustomizationUseCase: UpdateCheckoutCustomizationUseCase;
  private readonly validator: Validator<
    Omit<UpdateCheckoutCustomizationInput, "accountId" | "userId">
  >;

  constructor(
    updateCheckoutCustomizationUseCase: UpdateCheckoutCustomizationUseCase,
    validator: Validator<Omit<UpdateCheckoutCustomizationInput, "accountId" | "userId">>,
  ) {
    this.updateCheckoutCustomizationUseCase = updateCheckoutCustomizationUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId, userId } = requirePrincipal(request);
    const input = this.validator.validate(mergeBodyAndParams(request));

    return ok(
      await this.updateCheckoutCustomizationUseCase.execute({ ...input, accountId, userId }),
    );
  }
}
