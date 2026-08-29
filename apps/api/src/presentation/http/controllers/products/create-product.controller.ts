import type {
  CreateProductInput,
  CreateProductUseCase,
} from "@/application/products/use-cases/create-product.usecase";
import { created } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class CreateProductController implements Controller {
  private readonly createProductUseCase: CreateProductUseCase;
  private readonly validator: Validator<Omit<CreateProductInput, "accountId">>;

  constructor(
    createProductUseCase: CreateProductUseCase,
    validator: Validator<Omit<CreateProductInput, "accountId">>,
  ) {
    this.createProductUseCase = createProductUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.body);

    return created(await this.createProductUseCase.execute({ ...input, accountId }));
  }
}
