import type { GetGatewayConnectionUseCase } from "@/application/gateways/use-cases/get-gateway-connection.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";

export class GetGatewayConnectionController implements Controller {
  private readonly getGatewayConnectionUseCase: GetGatewayConnectionUseCase;

  constructor(getGatewayConnectionUseCase: GetGatewayConnectionUseCase) {
    this.getGatewayConnectionUseCase = getGatewayConnectionUseCase;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);

    return ok(await this.getGatewayConnectionUseCase.execute({ accountId }));
  }
}
