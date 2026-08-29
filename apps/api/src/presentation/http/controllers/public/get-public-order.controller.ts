import type {
  GetPublicOrderInput,
  GetPublicOrderUseCase,
} from "@/application/public/use-cases/get-public-order.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

/** Rota **pública** (RF-PUB-06): o id do pedido é a credencial. */
export class GetPublicOrderController implements Controller {
  private readonly getPublicOrderUseCase: GetPublicOrderUseCase;
  private readonly validator: Validator<GetPublicOrderInput>;

  constructor(
    getPublicOrderUseCase: GetPublicOrderUseCase,
    validator: Validator<GetPublicOrderInput>,
  ) {
    this.getPublicOrderUseCase = getPublicOrderUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const input = this.validator.validate(request.params);

    return ok(await this.getPublicOrderUseCase.execute(input));
  }
}
