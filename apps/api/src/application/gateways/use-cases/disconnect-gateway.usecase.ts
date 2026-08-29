import type { GatewayConnectionDto } from "@/application/gateways/dtos/gateway-connection.dto";
import { toGatewayConnectionDto } from "@/application/gateways/mappers/gateway-connection.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import { GatewayNotConnectedError } from "@/domain/gateways/errors/gateway-not-connected.error";
import type { GatewayConnectionsRepository } from "@/domain/gateways/repositories/gateway-connections.repository";

export interface DisconnectGatewayInput {
  accountId: string;
}

export type DisconnectGatewayUseCase = UseCase<DisconnectGatewayInput, GatewayConnectionDto>;

/**
 * RF-GTW-04: as páginas públicas param de gerar PIX e as credenciais são
 * descartadas. Pedidos pendentes não são tocados — seguem para confirmação ou
 * expiração normalmente.
 */
export class DefaultDisconnectGatewayUseCase implements DisconnectGatewayUseCase {
  private readonly gatewayConnectionsRepository: GatewayConnectionsRepository;
  private readonly clock: Clock;

  constructor(gatewayConnectionsRepository: GatewayConnectionsRepository, clock: Clock) {
    this.gatewayConnectionsRepository = gatewayConnectionsRepository;
    this.clock = clock;
  }

  async execute({ accountId }: DisconnectGatewayInput): Promise<GatewayConnectionDto> {
    const connection = await this.gatewayConnectionsRepository.findByAccount(accountId);

    if (!connection) {
      throw new GatewayNotConnectedError();
    }

    connection.disconnect(this.clock.now());

    await this.gatewayConnectionsRepository.update(connection);

    return toGatewayConnectionDto(connection);
  }
}
