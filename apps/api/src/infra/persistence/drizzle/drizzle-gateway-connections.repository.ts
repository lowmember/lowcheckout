import { and, eq } from "drizzle-orm";

import type { GatewayConnection } from "@/domain/gateways/entities/gateway-connection.entity";
import type { GatewayConnectionsRepository } from "@/domain/gateways/repositories/gateway-connections.repository";
import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";
import type { Database } from "@/infra/persistence/drizzle/database";
import {
  toGatewayConnection,
  toGatewayConnectionRow,
} from "@/infra/persistence/drizzle/mappers/gateway-connection.mapper";
import { gatewayConnections } from "@/infra/persistence/drizzle/schema";

export class DrizzleGatewayConnectionsRepository implements GatewayConnectionsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /** No MVP a conta tem no máximo uma conexão, então a primeira é a conexão. */
  async findByAccount(accountId: string): Promise<GatewayConnection | null> {
    const [row] = await this.db
      .select()
      .from(gatewayConnections)
      .where(eq(gatewayConnections.accountId, accountId))
      .limit(1);

    return row ? toGatewayConnection(row) : null;
  }

  async findByAccountAndProvider(
    accountId: string,
    provider: GatewayProvider,
  ): Promise<GatewayConnection | null> {
    const [row] = await this.db
      .select()
      .from(gatewayConnections)
      .where(
        and(
          eq(gatewayConnections.accountId, accountId),
          eq(gatewayConnections.provider, provider),
        ),
      )
      .limit(1);

    return row ? toGatewayConnection(row) : null;
  }

  async create(connection: GatewayConnection): Promise<void> {
    await this.db.insert(gatewayConnections).values(toGatewayConnectionRow(connection));
  }

  async update(connection: GatewayConnection): Promise<void> {
    const row = toGatewayConnectionRow(connection);

    await this.db
      .update(gatewayConnections)
      .set(row)
      .where(
        and(eq(gatewayConnections.accountId, row.accountId), eq(gatewayConnections.id, row.id)),
      );
  }
}
