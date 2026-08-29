import { boolean, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { PIXEL_PROVIDERS } from "@/domain/checkouts/value-objects/pixel-provider";
import { accounts } from "@/infra/persistence/drizzle/schema/accounts.table";
import { checkouts } from "@/infra/persistence/drizzle/schema/checkouts.table";

export const pixelProvider = pgEnum("pixel_provider", PIXEL_PROVIDERS);

/**
 * Tracking é por checkout (cada checkout ≈ uma campanha), ao contrário do
 * gateway, que é global da conta. `access_token` guarda credencial de terceiro
 * e é gravado cifrado pela aplicação.
 */
export const checkoutPixels = pgTable(
  "checkout_pixels",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("account_id", { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    checkoutId: varchar("checkout_id", { length: 36 })
      .notNull()
      .references(() => checkouts.id, { onDelete: "cascade" }),
    provider: pixelProvider("provider").notNull(),
    externalId: varchar("external_id", { length: 120 }).notNull(),
    accessToken: text("access_token"),
    config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
    isEnabled: boolean("is_enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("checkout_pixels_checkout_id_provider_unique").on(table.checkoutId, table.provider),
  ],
);

export type CheckoutPixelRow = typeof checkoutPixels.$inferSelect;
export type NewCheckoutPixelRow = typeof checkoutPixels.$inferInsert;
