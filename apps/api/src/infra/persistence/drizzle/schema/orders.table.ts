import { index, integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { ORDER_STATUSES } from "@/domain/orders/value-objects/order-status";
import { accounts } from "@/infra/persistence/drizzle/schema/accounts.table";
import { buyers } from "@/infra/persistence/drizzle/schema/buyers.table";
import { checkoutOffers } from "@/infra/persistence/drizzle/schema/checkout-offers.table";
import { checkouts } from "@/infra/persistence/drizzle/schema/checkouts.table";
import { offers } from "@/infra/persistence/drizzle/schema/offers.table";
import { products } from "@/infra/persistence/drizzle/schema/products.table";

export const orderStatus = pgEnum("order_status", ORDER_STATUSES);

/**
 * O pedido nasce de um par (checkout, oferta) concreto. As colunas `*_snapshot`
 * são o ponto central da tabela: preço, nome e entregável são copiados na compra
 * (RF-PAG-06), para que editar uma oferta não reescreva o histórico.
 */
export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("account_id", { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    checkoutOfferId: varchar("checkout_offer_id", { length: 36 })
      .notNull()
      .references(() => checkoutOffers.id, { onDelete: "restrict" }),
    // Denormalizados para o funil e o ranking sem três joins.
    checkoutId: varchar("checkout_id", { length: 36 })
      .notNull()
      .references(() => checkouts.id, { onDelete: "restrict" }),
    offerId: varchar("offer_id", { length: 36 })
      .notNull()
      .references(() => offers.id, { onDelete: "restrict" }),
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    buyerId: varchar("buyer_id", { length: 36 })
      .notNull()
      .references(() => buyers.id, { onDelete: "restrict" }),
    status: orderStatus("status").notNull().default("awaiting_payment"),
    amountInCents: integer("amount_in_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    productNameSnapshot: varchar("product_name_snapshot", { length: 120 }).notNull(),
    offerNameSnapshot: varchar("offer_name_snapshot", { length: 120 }).notNull(),
    /** Fallback oferta → produto já resolvido no momento da compra. */
    deliveryUrlSnapshot: text("delivery_url_snapshot").notNull(),
    buyerName: varchar("buyer_name", { length: 160 }).notNull(),
    buyerEmail: varchar("buyer_email", { length: 255 }).notNull(),
    buyerDocument: varchar("buyer_document", { length: 11 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true, mode: "date" }),
    deliverySentAt: timestamp("delivery_sent_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    index("orders_account_id_status_created_at_idx").on(
      table.accountId,
      table.status,
      table.createdAt,
    ),
    index("orders_checkout_id_created_at_idx").on(table.checkoutId, table.createdAt),
    /** Faturamento por período (RF-ANL-02). */
    index("orders_account_id_paid_at_idx").on(table.accountId, table.paidAt),
    /** Job de expiração (RF-PAG-03). */
    index("orders_status_expires_at_idx").on(table.status, table.expiresAt),
  ],
);

export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;
