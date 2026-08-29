import { index, jsonb, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

import type { CheckoutCustomizationProps } from "@/domain/checkouts/value-objects/checkout-customization";
import { CUSTOMIZATION_SOURCES } from "@/domain/checkouts/value-objects/customization-source";
import { checkouts } from "@/infra/persistence/drizzle/schema/checkouts.table";
import { users } from "@/infra/persistence/drizzle/schema/users.table";

export const checkoutCustomizationSource = pgEnum(
  "checkout_customization_source",
  CUSTOMIZATION_SOURCES,
);

/**
 * Existe para dar reversão ao "Importar JSON", que sobrescreve a customização
 * atual (RF-CHK-08).
 *
 * `created_by_user_id` é **nulável**, ao contrário do que o modelo de dados
 * previa. Duas razões medidas contra o banco:
 *
 * 1. nem toda revisão tem autor humano — a geração por IA (RF-CHK-11), um
 *    import automatizado ou um backfill escrevem sem usuário, e com `not null`
 *    o insert simplesmente quebra;
 * 2. com `not null` + `on delete restrict`, um usuário que algum dia customizou
 *    um checkout **nunca mais pode ser removido**, o que colide com a exclusão
 *    de dados pessoais de RF-CONF-04.
 *
 * `on delete set null` preserva a revisão (o histórico de customização não é
 * dado pessoal) e libera a remoção do usuário. Autor nulo lê-se "não foi uma
 * pessoa", que é mais honesto do que atribuir um import a quem o disparou.
 */
export const checkoutCustomizationRevisions = pgTable(
  "checkout_customization_revisions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    checkoutId: varchar("checkout_id", { length: 36 })
      .notNull()
      .references(() => checkouts.id, { onDelete: "cascade" }),
    customization: jsonb("customization").$type<CheckoutCustomizationProps>().notNull(),
    source: checkoutCustomizationSource("source").notNull(),
    createdByUserId: varchar("created_by_user_id", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    index("checkout_customization_revisions_checkout_id_created_at_idx").on(
      table.checkoutId,
      table.createdAt.desc(),
    ),
  ],
);

export type CheckoutCustomizationRevisionRow = typeof checkoutCustomizationRevisions.$inferSelect;
export type NewCheckoutCustomizationRevisionRow = typeof checkoutCustomizationRevisions.$inferInsert;
