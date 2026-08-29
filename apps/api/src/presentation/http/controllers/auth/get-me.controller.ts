import type { GetMeUseCase } from "@/application/auth/use-cases/get-me.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";

export class GetMeController implements Controller {
  private readonly getMeUseCase: GetMeUseCase;

  constructor(getMeUseCase: GetMeUseCase) {
    this.getMeUseCase = getMeUseCase;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId, userId } = requirePrincipal(request);

    return ok(await this.getMeUseCase.execute({ accountId, userId }));
  }
}
