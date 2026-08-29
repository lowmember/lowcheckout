import type {
  UpdateAccountInput,
  UpdateAccountUseCase,
} from "@/application/accounts/use-cases/update-account.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class UpdateAccountController implements Controller {
  private readonly updateAccountUseCase: UpdateAccountUseCase;
  private readonly validator: Validator<Omit<UpdateAccountInput, "accountId" | "userId">>;

  constructor(
    updateAccountUseCase: UpdateAccountUseCase,
    validator: Validator<Omit<UpdateAccountInput, "accountId" | "userId">>,
  ) {
    this.updateAccountUseCase = updateAccountUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId, userId } = requirePrincipal(request);
    const input = this.validator.validate(request.body);

    return ok(await this.updateAccountUseCase.execute({ ...input, accountId, userId }));
  }
}
