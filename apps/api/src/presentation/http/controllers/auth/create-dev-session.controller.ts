import type {
  CreateDevSessionInput,
  CreateDevSessionUseCase,
} from "@/application/auth/use-cases/create-dev-session.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

/**
 * Rota pública, como as demais de `/auth`: é ela que cria a sessão, então não
 * pode exigir `principal`. Fora de desenvolvimento o caso de uso responde 404.
 */
export class CreateDevSessionController implements Controller {
  private readonly createDevSessionUseCase: CreateDevSessionUseCase;
  private readonly validator: Validator<CreateDevSessionInput>;

  constructor(
    createDevSessionUseCase: CreateDevSessionUseCase,
    validator: Validator<CreateDevSessionInput>,
  ) {
    this.createDevSessionUseCase = createDevSessionUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const input = this.validator.validate(request.body);

    return ok(await this.createDevSessionUseCase.execute(input));
  }
}
