import { index, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { accounts } from "@/infra/persistence/drizzle/schema/accounts.table";
import { orders, orderStatus } from "@/infra/persistence/drizzle/schema/orders.table";

/**
 * Trilha das transições do pedido (RF-PAG-02). `from_status` é nulo no evento de
 * criação. Guarda o motivo — útil justamente no caso `expired → paid`, em que o
 * webhook chega depois do job de expiração e o pagamento confirmado prevalece.
 */
export const orderEvents = pgTable(
  "order_events",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("account_id", { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    orderId: varchar("order_id", { length: 36 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: orderStatus("from_status"),
    toStatus: orderStatus("to_status").notNull(),
    reason: text("reason"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("order_events_order_id_occurred_at_idx").on(table.orderId, table.occurredAt)],
);

export type OrderEventRow = typeof orderEvents.$inferSelect;
export type NewOrderEventRow = typeof orderEvents.$inferInsert;
