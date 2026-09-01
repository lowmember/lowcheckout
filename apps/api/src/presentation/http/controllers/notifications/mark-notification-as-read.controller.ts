import type {
  MarkNotificationAsReadInput,
  MarkNotificationAsReadUseCase,
} from "@/application/notifications/use-cases/mark-notification-as-read.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class MarkNotificationAsReadController implements Controller {
  private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase;
  private readonly validator: Validator<Omit<MarkNotificationAsReadInput, "accountId">>;

  constructor(
    markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
    validator: Validator<Omit<MarkNotificationAsReadInput, "accountId">>,
  ) {
    this.markNotificationAsReadUseCase = markNotificationAsReadUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.params);

    return ok(await this.markNotificationAsReadUseCase.execute({ ...input, accountId }));
  }
}
