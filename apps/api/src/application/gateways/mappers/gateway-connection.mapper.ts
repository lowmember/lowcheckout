import type { GatewayConnectionDto } from "@/application/gateways/dtos/gateway-connection.dto";
import type { GatewayConnection } from "@/domain/gateways/entities/gateway-connection.entity";

export function toGatewayConnectionDto(connection: GatewayConnection): GatewayConnectionDto {
  const snapshot = connection.toSnapshot();

  return {
    id: snapshot.id,
    provider: snapshot.provider,
    environment: snapshot.environment,
    status: snapshot.status,
    pixKey: snapshot.pixKey,
    lastError: snapshot.lastError,
    connectedAt: snapshot.connectedAt?.toISOString() ?? null,
    lastCheckedAt: snapshot.lastCheckedAt?.toISOString() ?? null,
    createdAt: snapshot.createdAt.toISOString(),
    updatedAt: snapshot.updatedAt.toISOString(),
  };
}
