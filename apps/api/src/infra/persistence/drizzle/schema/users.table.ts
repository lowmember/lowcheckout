import { index, pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { accounts } from "@/infra/persistence/drizzle/schema/accounts.table";

/**
 * Identidade Google. Não existe coluna de senha: o login é exclusivamente
 * social (RF-AUTH-01) e `google_sub` é a chave estável, não o e-mail.
 */
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("account_id", { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    googleSub: varchar("google_sub", { length: 64 }).notNull(),
    /** Vem do Google e é imutável pela aplicação; o editável é `accounts.contact_email`. */
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    avatarUrl: text("avatar_url"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("users_google_sub_unique").on(table.googleSub),
    uniqueIndex("users_email_unique").on(table.email),
    index("users_account_id_idx").on(table.accountId),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
