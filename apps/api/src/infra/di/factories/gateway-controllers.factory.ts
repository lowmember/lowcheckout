import { DefaultConnectGatewayUseCase } from "@/application/gateways/use-cases/connect-gateway.usecase";
import { DefaultDisconnectGatewayUseCase } from "@/application/gateways/use-cases/disconnect-gateway.usecase";
import { DefaultGetGatewayConnectionUseCase } from "@/application/gateways/use-cases/get-gateway-connection.usecase";
import { getContainer } from "@/infra/di/container";
import { withOnboardedAccount, withPanelAccess } from "@/infra/di/factories/with-account-guard";
import { withErrorHandling } from "@/infra/di/factories/with-error-handling";
import { connectGatewaySchema } from "@/infra/validation/zod/schemas/gateway.schemas";
import { ZodValidator } from "@/infra/validation/zod/zod-validator.adapter";
import { ConnectGatewayController } from "@/presentation/http/controllers/gateways/connect-gateway.controller";
import { DisconnectGatewayController } from "@/presentation/http/controllers/gateways/disconnect-gateway.controller";
import { GetGatewayConnectionController } from "@/presentation/http/controllers/gateways/get-gateway-connection.controller";

export function makeGetGatewayConnectionController() {
  const { gatewayConnectionsRepository } = getContainer();

  return withErrorHandling(
    new GetGatewayConnectionController(
      withPanelAccess(new DefaultGetGatewayConnectionUseCase(gatewayConnectionsRepository)),
    ),
  );
}

export function makeConnectGatewayController() {
  const { gatewayConnectionsRepository, paymentGateway, encrypter, idGenerator, clock } =
    getContainer();

  // Conectar gateway é uma das ações que o onboarding pendente bloqueia (RF-ONB-01).
  return withErrorHandling(
    new ConnectGatewayController(
      withOnboardedAccount(
        new DefaultConnectGatewayUseCase(
          gatewayConnectionsRepository,
          paymentGateway,
          encrypter,
          idGenerator,
          clock,
        ),
      ),
      new ZodValidator(connectGatewaySchema),
    ),
  );
}

export function makeDisconnectGatewayController() {
  const { gatewayConnectionsRepository, clock } = getContainer();

  return withErrorHandling(
    new DisconnectGatewayController(
      withOnboardedAccount(
        new DefaultDisconnectGatewayUseCase(gatewayConnectionsRepository, clock),
      ),
    ),
  );
}
