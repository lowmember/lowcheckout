import { GatewayConnection } from "@/domain/gateways/entities/gateway-connection.entity";
import type {
  GatewayConnectionRow,
  NewGatewayConnectionRow,
} from "@/infra/persistence/drizzle/schema";

/**
 * A coluna é `jsonb not null`, mas o conteúdo é opaco: guardamos o texto
 * cifrado dentro de um envelope `{ encrypted }`. Assim a forma documentada do
 * schema é respeitada e nada legível chega ao banco.
 */
interface EncryptedCredentialsEnvelope {
  encrypted?: string;
}

export function toGatewayConnection(row: GatewayConnectionRow): GatewayConnection {
  const envelope = row.credentials as EncryptedCredentialsEnvelope;

  return GatewayConnection.restore({
    id: row.id,
    accountId: row.accountId,
    provider: row.provider,
    environment: row.environment,
    status: row.status,
    encryptedCredentials: typeof envelope.encrypted === "string" ? envelope.encrypted : null,
    pixKey: row.pixKey,
    lastError: row.lastError,
    connectedAt: row.connectedAt,
    lastCheckedAt: row.lastCheckedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function toGatewayConnectionRow(connection: GatewayConnection): NewGatewayConnectionRow {
  const snapshot = connection.toSnapshot();

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    provider: snapshot.provider,
    environment: snapshot.environment,
    status: snapshot.status,
    credentials:
      snapshot.encryptedCredentials === null ? {} : { encrypted: snapshot.encryptedCredentials },
    pixKey: snapshot.pixKey,
    lastError: snapshot.lastError,
    connectedAt: snapshot.connectedAt,
    lastCheckedAt: snapshot.lastCheckedAt,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}
