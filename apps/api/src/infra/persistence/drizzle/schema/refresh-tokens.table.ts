import { index, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { users } from "@/infra/persistence/drizzle/schema/users.table";

/**
 * Sessão da API. Guarda o SHA-256 do token, nunca o token em claro. Só é
 * necessária se a API emitir refresh token próprio; com JWT curto + re-login
 * Google, fica vazia.
 */
export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("refresh_tokens_token_hash_unique").on(table.tokenHash),
    index("refresh_tokens_user_id_expires_at_idx").on(table.userId, table.expiresAt),
  ],
);

export type RefreshTokenRow = typeof refreshTokens.$inferSelect;
export type NewRefreshTokenRow = typeof refreshTokens.$inferInsert;
