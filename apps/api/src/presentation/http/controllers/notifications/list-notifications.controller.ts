import type {
  ListNotificationsInput,
  ListNotificationsUseCase,
} from "@/application/notifications/use-cases/list-notifications.usecase";
import { okPage } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class ListNotificationsController implements Controller {
  private readonly listNotificationsUseCase: ListNotificationsUseCase;
  private readonly validator: Validator<Omit<ListNotificationsInput, "accountId">>;

  constructor(
    listNotificationsUseCase: ListNotificationsUseCase,
    validator: Validator<Omit<ListNotificationsInput, "accountId">>,
  ) {
    this.listNotificationsUseCase = listNotificationsUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.query);

    return okPage(await this.listNotificationsUseCase.execute({ ...input, accountId }));
  }
}
