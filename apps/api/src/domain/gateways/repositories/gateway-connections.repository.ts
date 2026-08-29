import type { GatewayConnection } from "@/domain/gateways/entities/gateway-connection.entity";
import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";

/**
 * Porta da conexão de gateway. A chave é a conta, não o checkout: uma conta tem
 * no máximo uma conexão por provider (RF-GTW-01/03).
 */
export interface GatewayConnectionsRepository {
  findByAccount(accountId: string): Promise<GatewayConnection | null>;
  findByAccountAndProvider(
    accountId: string,
    provider: GatewayProvider,
  ): Promise<GatewayConnection | null>;
  create(connection: GatewayConnection): Promise<void>;
  update(connection: GatewayConnection): Promise<void>;
}
