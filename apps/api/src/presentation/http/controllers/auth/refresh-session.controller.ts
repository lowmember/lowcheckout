import type {
  RefreshSessionInput,
  RefreshSessionUseCase,
} from "@/application/auth/use-cases/refresh-session.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

/** Rota pública: o access token já expirou quando esta rota é chamada. */
export class RefreshSessionController implements Controller {
  private readonly refreshSessionUseCase: RefreshSessionUseCase;
  private readonly validator: Validator<RefreshSessionInput>;

  constructor(
    refreshSessionUseCase: RefreshSessionUseCase,
    validator: Validator<RefreshSessionInput>,
  ) {
    this.refreshSessionUseCase = refreshSessionUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const input = this.validator.validate(request.body);

    return ok(await this.refreshSessionUseCase.execute(input));
  }
}
