import type {
  GetPublicOrderStatusInput,
  GetPublicOrderStatusUseCase,
} from "@/application/public/use-cases/get-public-order-status.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

/** Rota **pública** (RF-PUB-05): o polling da tela do PIX. */
export class GetPublicOrderStatusController implements Controller {
  private readonly getPublicOrderStatusUseCase: GetPublicOrderStatusUseCase;
  private readonly validator: Validator<GetPublicOrderStatusInput>;

  constructor(
    getPublicOrderStatusUseCase: GetPublicOrderStatusUseCase,
    validator: Validator<GetPublicOrderStatusInput>,
  ) {
    this.getPublicOrderStatusUseCase = getPublicOrderStatusUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const input = this.validator.validate(request.params);

    return ok(await this.getPublicOrderStatusUseCase.execute(input));
  }
}
