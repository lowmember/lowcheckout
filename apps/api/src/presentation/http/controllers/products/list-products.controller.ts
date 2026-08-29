import type {
  ListProductsInput,
  ListProductsUseCase,
} from "@/application/products/use-cases/list-products.usecase";
import { okPage } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class ListProductsController implements Controller {
  private readonly listProductsUseCase: ListProductsUseCase;
  private readonly validator: Validator<Omit<ListProductsInput, "accountId">>;

  constructor(
    listProductsUseCase: ListProductsUseCase,
    validator: Validator<Omit<ListProductsInput, "accountId">>,
  ) {
    this.listProductsUseCase = listProductsUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.query);

    return okPage(await this.listProductsUseCase.execute({ ...input, accountId }));
  }
}
