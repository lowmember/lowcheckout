import type {
  AuthenticateWithGoogleInput,
  AuthenticateWithGoogleUseCase,
} from "@/application/auth/use-cases/authenticate-with-google.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

/** Rota pública: é ela que cria a sessão, então não pode exigir `principal`. */
export class AuthenticateWithGoogleController implements Controller {
  private readonly authenticateWithGoogleUseCase: AuthenticateWithGoogleUseCase;
  private readonly validator: Validator<AuthenticateWithGoogleInput>;

  constructor(
    authenticateWithGoogleUseCase: AuthenticateWithGoogleUseCase,
    validator: Validator<AuthenticateWithGoogleInput>,
  ) {
    this.authenticateWithGoogleUseCase = authenticateWithGoogleUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const input = this.validator.validate(request.body);

    return ok(await this.authenticateWithGoogleUseCase.execute(input));
  }
}
