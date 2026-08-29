import type { DisconnectGatewayUseCase } from "@/application/gateways/use-cases/disconnect-gateway.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";

export class DisconnectGatewayController implements Controller {
  private readonly disconnectGatewayUseCase: DisconnectGatewayUseCase;

  constructor(disconnectGatewayUseCase: DisconnectGatewayUseCase) {
    this.disconnectGatewayUseCase = disconnectGatewayUseCase;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);

    return ok(await this.disconnectGatewayUseCase.execute({ accountId }));
  }
}
