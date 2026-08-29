import type {
  DeleteCheckoutInput,
  DeleteCheckoutUseCase,
} from "@/application/checkouts/use-cases/delete-checkout.usecase";
import { noContent } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class DeleteCheckoutController implements Controller {
  private readonly deleteCheckoutUseCase: DeleteCheckoutUseCase;
  private readonly validator: Validator<Omit<DeleteCheckoutInput, "accountId">>;

  constructor(
    deleteCheckoutUseCase: DeleteCheckoutUseCase,
    validator: Validator<Omit<DeleteCheckoutInput, "accountId">>,
  ) {
    this.deleteCheckoutUseCase = deleteCheckoutUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.params);

    await this.deleteCheckoutUseCase.execute({ ...input, accountId });

    return noContent();
  }
}
