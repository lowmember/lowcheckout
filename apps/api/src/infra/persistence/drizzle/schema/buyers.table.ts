import { index, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { accounts } from "@/infra/persistence/drizzle/schema/accounts.table";

/**
 * O comprador não tem conta nem painel: este registro existe para dar ao
 * lojista o histórico de quem comprou dele. Escopo por conta de propósito — o
 * mesmo CPF comprando de dois lojistas são dois registros. Dado pessoal (LGPD).
 */
export const buyers = pgTable(
  "buyers",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("account_id", { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    /** CPF, só dígitos. */
    document: varchar("document", { length: 11 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("buyers_account_id_email_unique").on(table.accountId, table.email),
    index("buyers_account_id_document_idx").on(table.accountId, table.document),
  ],
);

export type BuyerRow = typeof buyers.$inferSelect;
export type NewBuyerRow = typeof buyers.$inferInsert;
