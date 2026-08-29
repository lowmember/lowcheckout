import type {
  GetProductInput,
  GetProductUseCase,
} from "@/application/products/use-cases/get-product.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class GetProductController implements Controller {
  private readonly getProductUseCase: GetProductUseCase;
  private readonly validator: Validator<Omit<GetProductInput, "accountId">>;

  constructor(
    getProductUseCase: GetProductUseCase,
    validator: Validator<Omit<GetProductInput, "accountId">>,
  ) {
    this.getProductUseCase = getProductUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.params);

    return ok(await this.getProductUseCase.execute({ ...input, accountId }));
  }
}
