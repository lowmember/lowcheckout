import type { GatewayConnectionDto } from "@/application/gateways/dtos/gateway-connection.dto";
import { toGatewayConnectionDto } from "@/application/gateways/mappers/gateway-connection.mapper";
import type { UseCase } from "@/application/shared/use-case";
import type { GatewayConnectionsRepository } from "@/domain/gateways/repositories/gateway-connections.repository";

export interface GetGatewayConnectionInput {
  accountId: string;
}

export type GetGatewayConnectionUseCase = UseCase<
  GetGatewayConnectionInput,
  GatewayConnectionDto | null
>;

/** `null` é o estado "não conectado" da página de Gateway (RF-GTW-01), não um erro. */
export class DefaultGetGatewayConnectionUseCase implements GetGatewayConnectionUseCase {
  private readonly gatewayConnectionsRepository: GatewayConnectionsRepository;

  constructor(gatewayConnectionsRepository: GatewayConnectionsRepository) {
    this.gatewayConnectionsRepository = gatewayConnectionsRepository;
  }

  async execute({ accountId }: GetGatewayConnectionInput): Promise<GatewayConnectionDto | null> {
    const connection = await this.gatewayConnectionsRepository.findByAccount(accountId);

    return connection ? toGatewayConnectionDto(connection) : null;
  }
}
