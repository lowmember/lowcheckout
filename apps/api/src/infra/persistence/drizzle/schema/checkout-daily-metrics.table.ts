import { date, integer, pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";

import { accounts } from "@/infra/persistence/drizzle/schema/accounts.table";
import { checkouts } from "@/infra/persistence/drizzle/schema/checkouts.table";

/**
 * Rollup diário. Enquanto o volume for baixo, a home lê direto de `orders` e
 * `checkout_events`; esta tabela é a saída quando o `count(*)` sobre eventos
 * parar de responder no seletor "30 dias".
 */
export const checkoutDailyMetrics = pgTable(
  "checkout_daily_metrics",
  {
    accountId: varchar("account_id", { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    checkoutId: varchar("checkout_id", { length: 36 })
      .notNull()
      .references(() => checkouts.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    views: integer("views").notNull().default(0),
    pixGenerated: integer("pix_generated").notNull().default(0),
    ordersPaid: integer("orders_paid").notNull().default(0),
    revenueInCents: integer("revenue_in_cents").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    primaryKey({
      name: "checkout_daily_metrics_checkout_id_day_pk",
      columns: [table.checkoutId, table.day],
    }),
  ],
);

export type CheckoutDailyMetricRow = typeof checkoutDailyMetrics.$inferSelect;
export type NewCheckoutDailyMetricRow = typeof checkoutDailyMetrics.$inferInsert;
