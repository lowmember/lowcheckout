import { jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { GATEWAY_ENVIRONMENTS } from "@/domain/gateways/value-objects/gateway-environment";
import { GATEWAY_PROVIDERS } from "@/domain/gateways/value-objects/gateway-provider";
import { GATEWAY_STATUSES } from "@/domain/gateways/value-objects/gateway-status";
import { accounts } from "@/infra/persistence/drizzle/schema/accounts.table";

export const gatewayProvider = pgEnum("gateway_provider", GATEWAY_PROVIDERS);
export const gatewayStatus = pgEnum("gateway_status", GATEWAY_STATUSES);
export const gatewayEnvironment = pgEnum("gateway_environment", GATEWAY_ENVIRONMENTS);

/**
 * Gateway é global da conta: conecta uma vez e todo checkout herda (RF-GTW-03) —
 * por isso a chave é `account_id`, não `checkout_id`. `credentials` guarda
 * credencial de terceiro e é gravado cifrado pela aplicação.
 */
export const gatewayConnections = pgTable(
  "gateway_connections",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("account_id", { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    provider: gatewayProvider("provider").notNull(),
    environment: gatewayEnvironment("environment").notNull().default("sandbox"),
    status: gatewayStatus("status").notNull().default("disconnected"),
    credentials: jsonb("credentials").$type<Record<string, unknown>>().notNull(),
    pixKey: varchar("pix_key", { length: 160 }),
    lastError: text("last_error"),
    connectedAt: timestamp("connected_at", { withTimezone: true, mode: "date" }),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("gateway_connections_account_id_provider_unique").on(
      table.accountId,
      table.provider,
    ),
  ],
);

export type GatewayConnectionRow = typeof gatewayConnections.$inferSelect;
export type NewGatewayConnectionRow = typeof gatewayConnections.$inferInsert;
