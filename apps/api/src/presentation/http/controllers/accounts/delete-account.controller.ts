import type { DeleteAccountUseCase } from "@/application/accounts/use-cases/delete-account.usecase";
import { noContent } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";

export class DeleteAccountController implements Controller {
  private readonly deleteAccountUseCase: DeleteAccountUseCase;

  constructor(deleteAccountUseCase: DeleteAccountUseCase) {
    this.deleteAccountUseCase = deleteAccountUseCase;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId, userId } = requirePrincipal(request);

    await this.deleteAccountUseCase.execute({ accountId, userId });

    return noContent();
  }
}
