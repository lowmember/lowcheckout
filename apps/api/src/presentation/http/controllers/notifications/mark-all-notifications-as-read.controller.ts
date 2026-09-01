import type { MarkAllNotificationsAsReadUseCase } from "@/application/notifications/use-cases/mark-all-notifications-as-read.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";

export class MarkAllNotificationsAsReadController implements Controller {
  private readonly markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase;

  constructor(markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase) {
    this.markAllNotificationsAsReadUseCase = markAllNotificationsAsReadUseCase;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);

    return ok(await this.markAllNotificationsAsReadUseCase.execute({ accountId }));
  }
}
