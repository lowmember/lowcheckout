import type {
  ConnectGatewayInput,
  ConnectGatewayUseCase,
} from "@/application/gateways/use-cases/connect-gateway.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class ConnectGatewayController implements Controller {
  private readonly connectGatewayUseCase: ConnectGatewayUseCase;
  private readonly validator: Validator<Omit<ConnectGatewayInput, "accountId">>;

  constructor(
    connectGatewayUseCase: ConnectGatewayUseCase,
    validator: Validator<Omit<ConnectGatewayInput, "accountId">>,
  ) {
    this.connectGatewayUseCase = connectGatewayUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.body);

    return ok(await this.connectGatewayUseCase.execute({ ...input, accountId }));
  }
}
