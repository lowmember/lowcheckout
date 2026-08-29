import type {
  CreatePublicOrderInput,
  CreatePublicOrderUseCase,
} from "@/application/public/use-cases/create-public-order.usecase";
import { created } from "@/presentation/http/helpers/http-responses";
import { mergeBodyAndParams } from "@/presentation/http/helpers/merge-body-and-params";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

/** Rota **pública** (RF-PUB-02/03): sem sessão, por definição. */
export class CreatePublicOrderController implements Controller {
  private readonly createPublicOrderUseCase: CreatePublicOrderUseCase;
  private readonly validator: Validator<CreatePublicOrderInput>;

  constructor(
    createPublicOrderUseCase: CreatePublicOrderUseCase,
    validator: Validator<CreatePublicOrderInput>,
  ) {
    this.createPublicOrderUseCase = createPublicOrderUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const input = this.validator.validate(mergeBodyAndParams(request));

    return created(await this.createPublicOrderUseCase.execute(input));
  }
}
