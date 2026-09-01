import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

import type { CheckoutCustomizationProps } from "@/domain/checkouts/value-objects/checkout-customization";
import { CHECKOUT_STATUSES } from "@/domain/checkouts/value-objects/checkout-status";
import { accounts } from "@/infra/persistence/drizzle/schema/accounts.table";
import { products } from "@/infra/persistence/drizzle/schema/products.table";

export const checkoutStatus = pgEnum("checkout_status", CHECKOUT_STATUSES);

/**
 * Sem `slug` e sem preço: a URL pública é por oferta (`checkout_offers.public_slug`)
 * e o preço é da oferta. O checkout guarda só a identidade e a customização.
 */
export const checkouts = pgTable(
  "checkouts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("account_id", { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    /** Título interno: só no painel. */
    internalTitle: varchar("internal_title", { length: 120 }).notNull(),
    /** Título da página pública e do footer. */
    displayName: varchar("display_name", { length: 120 }).notNull(),
    bannerDesktopUrl: text("banner_desktop_url"),
    bannerMobileUrl: text("banner_mobile_url"),
    /**
     * Builder e "Importar JSON" escrevem a mesma coluna (RF-CHK-07/08). O
     * default é `'{}'`, não o tema completo: quem conhece os valores padrão é o
     * value object `CheckoutCustomization`, que completa o que faltar na leitura.
     */
    customization: jsonb("customization")
      .$type<CheckoutCustomizationProps>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    status: checkoutStatus("status").notNull().default("draft"),
    /**
     * E-mail de contato exibido ao comprador — mora no checkout, não na conta,
     * porque cada checkout costuma ser uma campanha com um responsável.
     * Só sai da coluna `contact_email` depois de confirmado por código; enquanto
     * isso o endereço fica nas colunas `pending_*` junto do hash do código.
     */
    contactEmail: varchar("contact_email", { length: 255 }),
    contactEmailVerifiedAt: timestamp("contact_email_verified_at", {
      withTimezone: true,
      mode: "date",
    }),
    pendingContactEmail: varchar("pending_contact_email", { length: 255 }),
    pendingContactEmailCodeHash: varchar("pending_contact_email_code_hash", { length: 64 }),
    pendingContactEmailExpiresAt: timestamp("pending_contact_email_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    index("checkouts_account_id_status_created_at_idx").on(
      table.accountId,
      table.status,
      table.createdAt,
    ),
    index("checkouts_product_id_idx").on(table.productId),
    // Único redundante que sustenta a FK composta de `checkout_offers` — invariante (a).
    unique("checkouts_id_product_unique").on(table.id, table.productId),
  ],
);

export type CheckoutRow = typeof checkouts.$inferSelect;
export type NewCheckoutRow = typeof checkouts.$inferInsert;
