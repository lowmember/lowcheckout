import type {
  UpdateProductInput,
  UpdateProductUseCase,
} from "@/application/products/use-cases/update-product.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { mergeBodyAndParams } from "@/presentation/http/helpers/merge-body-and-params";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class UpdateProductController implements Controller {
  private readonly updateProductUseCase: UpdateProductUseCase;
  private readonly validator: Validator<Omit<UpdateProductInput, "accountId">>;

  constructor(
    updateProductUseCase: UpdateProductUseCase,
    validator: Validator<Omit<UpdateProductInput, "accountId">>,
  ) {
    this.updateProductUseCase = updateProductUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(mergeBodyAndParams(request));

    return ok(await this.updateProductUseCase.execute({ ...input, accountId }));
  }
}
