import type { DeactivateAccountUseCase } from "@/application/accounts/use-cases/deactivate-account.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";

export class DeactivateAccountController implements Controller {
  private readonly deactivateAccountUseCase: DeactivateAccountUseCase;

  constructor(deactivateAccountUseCase: DeactivateAccountUseCase) {
    this.deactivateAccountUseCase = deactivateAccountUseCase;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId, userId } = requirePrincipal(request);

    return ok(await this.deactivateAccountUseCase.execute({ accountId, userId }));
  }
}
