import { index, integer, pgEnum, pgTable, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";

import { OFFER_STATUSES } from "@/domain/offers/value-objects/offer-status";
import { accounts } from "@/infra/persistence/drizzle/schema/accounts.table";
import { products } from "@/infra/persistence/drizzle/schema/products.table";

export const offerStatus = pgEnum("offer_status", OFFER_STATUSES);

/** A variação comercial: é aqui que o preço mora, nunca no produto nem no checkout. */
export const offers = pgTable(
  "offers",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("account_id", { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    /** Uso interno: não aparece na página pública. */
    name: varchar("name", { length: 120 }).notNull(),
    priceInCents: integer("price_in_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    /** `null` = herda `products.default_delivery_url` (RF-OFER-02). */
    deliveryUrl: text("delivery_url"),
    status: offerStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    index("offers_account_id_product_id_status_idx").on(
      table.accountId,
      table.productId,
      table.status,
    ),
    // Único redundante que sustenta a FK composta de `checkout_offers` — invariante (a).
    unique("offers_id_product_unique").on(table.id, table.productId),
  ],
);

export type OfferRow = typeof offers.$inferSelect;
export type NewOfferRow = typeof offers.$inferInsert;
