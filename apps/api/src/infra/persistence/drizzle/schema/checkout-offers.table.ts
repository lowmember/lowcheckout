import {
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { accounts } from "@/infra/persistence/drizzle/schema/accounts.table";
import { checkouts } from "@/infra/persistence/drizzle/schema/checkouts.table";
import { offers } from "@/infra/persistence/drizzle/schema/offers.table";
import { products } from "@/infra/persistence/drizzle/schema/products.table";

/**
 * O vínculo manual checkout↔oferta e a URL pública que nasce dele (RF-CHK-05).
 * Tabela mais quente do sistema: a página pública resolve `public_slug` a cada acesso.
 */
export const checkoutOffers = pgTable(
  "checkout_offers",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("account_id", { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    checkoutId: varchar("checkout_id", { length: 36 })
      .notNull()
      .references(() => checkouts.id, { onDelete: "cascade" }),
    offerId: varchar("offer_id", { length: 36 })
      .notNull()
      .references(() => offers.id, { onDelete: "restrict" }),
    /** Redundante de propósito: é o que amarra as FKs compostas da invariante (a). */
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    publicSlug: varchar("public_slug", { length: 160 }).notNull(),
    position: integer("position").notNull().default(0),
    /** Desliga a URL sem desfazer o vínculo. */
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("checkout_offers_public_slug_unique").on(table.publicSlug),
    uniqueIndex("checkout_offers_checkout_id_offer_id_unique").on(table.checkoutId, table.offerId),
    index("checkout_offers_checkout_id_position_idx").on(table.checkoutId, table.position),
    // Invariante (a) no banco: vincular oferta de outro produto vira erro de
    // integridade referencial, e não só de regra de negócio.
    foreignKey({
      name: "checkout_offers_checkout_product_fk",
      columns: [table.checkoutId, table.productId],
      foreignColumns: [checkouts.id, checkouts.productId],
    }).onDelete("cascade"),
    foreignKey({
      name: "checkout_offers_offer_product_fk",
      columns: [table.offerId, table.productId],
      foreignColumns: [offers.id, offers.productId],
    }).onDelete("restrict"),
  ],
);

export type CheckoutOfferRow = typeof checkoutOffers.$inferSelect;
export type NewCheckoutOfferRow = typeof checkoutOffers.$inferInsert;
