import { index, jsonb, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

import { CHECKOUT_EVENT_TYPES } from "@/domain/checkouts/value-objects/checkout-event-type";
import { accounts } from "@/infra/persistence/drizzle/schema/accounts.table";
import { checkoutOffers } from "@/infra/persistence/drizzle/schema/checkout-offers.table";
import { checkouts } from "@/infra/persistence/drizzle/schema/checkouts.table";
import { orders } from "@/infra/persistence/drizzle/schema/orders.table";

export const checkoutEventType = pgEnum("checkout_event_type", CHECKOUT_EVENT_TYPES);

/**
 * Matéria-prima do funil por checkout: conversão e taxa de abandono do PIX
 * (RF-ANL-06). `visitor_id` é anônimo, gerado no browser.
 */
export const checkoutEvents = pgTable(
  "checkout_events",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("account_id", { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    checkoutId: varchar("checkout_id", { length: 36 })
      .notNull()
      .references(() => checkouts.id, { onDelete: "cascade" }),
    checkoutOfferId: varchar("checkout_offer_id", { length: 36 }).references(
      () => checkoutOffers.id,
      { onDelete: "set null" },
    ),
    orderId: varchar("order_id", { length: 36 }).references(() => orders.id, {
      onDelete: "set null",
    }),
    type: checkoutEventType("type").notNull(),
    visitorId: varchar("visitor_id", { length: 64 }).notNull(),
    utm: jsonb("utm").$type<Record<string, unknown>>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    index("checkout_events_checkout_id_type_occurred_at_idx").on(
      table.checkoutId,
      table.type,
      table.occurredAt,
    ),
    index("checkout_events_account_id_occurred_at_idx").on(table.accountId, table.occurredAt),
  ],
);

export type CheckoutEventRow = typeof checkoutEvents.$inferSelect;
export type NewCheckoutEventRow = typeof checkoutEvents.$inferInsert;
