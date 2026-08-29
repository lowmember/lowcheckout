import type { LogoutInput, LogoutUseCase } from "@/application/auth/use-cases/logout.usecase";
import { noContent } from "@/presentation/http/helpers/http-responses";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

/** Rota pública: quem está saindo pode já estar com o access token vencido. */
export class LogoutController implements Controller {
  private readonly logoutUseCase: LogoutUseCase;
  private readonly validator: Validator<LogoutInput>;

  constructor(logoutUseCase: LogoutUseCase, validator: Validator<LogoutInput>) {
    this.logoutUseCase = logoutUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    await this.logoutUseCase.execute(this.validator.validate(request.body));

    return noContent();
  }
}
