import { index, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { PRODUCT_STATUSES } from "@/domain/products/value-objects/product-status";
import { accounts } from "@/infra/persistence/drizzle/schema/accounts.table";

export const productStatus = pgEnum("product_status", PRODUCT_STATUSES);

/** Produto não tem preço: preço é atributo da oferta (RF-OFER-01). */
export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("account_id", { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    /** Fallback do entregável das ofertas — ver invariante (c) e RF-OFER-02. */
    defaultDeliveryUrl: text("default_delivery_url"),
    status: productStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    index("products_account_id_status_created_at_idx").on(
      table.accountId,
      table.status,
      table.createdAt,
    ),
  ],
);

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
