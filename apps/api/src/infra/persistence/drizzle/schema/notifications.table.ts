import { index, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { NOTIFICATION_TYPES } from "@/domain/notifications/value-objects/notification-type";
import { accounts } from "@/infra/persistence/drizzle/schema/accounts.table";
import { checkouts } from "@/infra/persistence/drizzle/schema/checkouts.table";
import { orders } from "@/infra/persistence/drizzle/schema/orders.table";

export const notificationType = pgEnum("notification_type", NOTIFICATION_TYPES);

/**
 * Avisos do sino do painel (RF-NOT-01). O texto é gravado pronto: a notificação
 * é um registro do que aconteceu, não uma consulta ao pedido — editar a oferta
 * depois não pode reescrever o histórico do aviso.
 */
export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("account_id", { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    type: notificationType("type").notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    body: text("body").notNull(),
    orderId: varchar("order_id", { length: 36 }).references(() => orders.id, {
      onDelete: "set null",
    }),
    checkoutId: varchar("checkout_id", { length: 36 }).references(() => checkouts.id, {
      onDelete: "set null",
    }),
    readAt: timestamp("read_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    index("notifications_account_id_created_at_idx").on(table.accountId, table.createdAt),
    index("notifications_account_id_read_at_idx").on(table.accountId, table.readAt),
  ],
);

export type NotificationRow = typeof notifications.$inferSelect;
export type NewNotificationRow = typeof notifications.$inferInsert;
