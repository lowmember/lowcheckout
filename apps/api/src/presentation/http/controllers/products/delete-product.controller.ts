import type {
  DeleteProductInput,
  DeleteProductUseCase,
} from "@/application/products/use-cases/delete-product.usecase";
import { noContent } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class DeleteProductController implements Controller {
  private readonly deleteProductUseCase: DeleteProductUseCase;
  private readonly validator: Validator<Omit<DeleteProductInput, "accountId">>;

  constructor(
    deleteProductUseCase: DeleteProductUseCase,
    validator: Validator<Omit<DeleteProductInput, "accountId">>,
  ) {
    this.deleteProductUseCase = deleteProductUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.params);

    await this.deleteProductUseCase.execute({ ...input, accountId });

    return noContent();
  }
}
