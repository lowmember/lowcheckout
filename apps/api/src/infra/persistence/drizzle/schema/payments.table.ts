import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { PAYMENT_METHODS } from "@/domain/payments/value-objects/payment-method";
import { PAYMENT_STATUSES } from "@/domain/payments/value-objects/payment-status";
import { accounts } from "@/infra/persistence/drizzle/schema/accounts.table";
import { gatewayProvider } from "@/infra/persistence/drizzle/schema/gateway-connections.table";
import { orders } from "@/infra/persistence/drizzle/schema/orders.table";

export const paymentStatus = pgEnum("payment_status", PAYMENT_STATUSES);
export const paymentMethod = pgEnum("payment_method", PAYMENT_METHODS);

/** 1:N com o pedido, não 1:1 — um PIX expirado pode ser regerado. */
export const payments = pgTable(
  "payments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("account_id", { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    orderId: varchar("order_id", { length: 36 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: gatewayProvider("provider").notNull(),
    method: paymentMethod("method").notNull().default("pix"),
    status: paymentStatus("status").notNull().default("pending"),
    externalChargeId: varchar("external_charge_id", { length: 120 }).notNull(),
    amountInCents: integer("amount_in_cents").notNull(),
    qrCodeImageUrl: text("qr_code_image_url"),
    /** Copia-e-cola do PIX (RF-PUB-04). */
    qrCodePayload: text("qr_code_payload"),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true, mode: "date" }),
    rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("payments_provider_external_charge_id_unique").on(
      table.provider,
      table.externalChargeId,
    ),
    index("payments_order_id_created_at_idx").on(table.orderId, table.createdAt),
    // Parcial: garante um único PIX vivo por pedido.
    uniqueIndex("payments_order_id_pending_unique")
      .on(table.orderId)
      .where(sql`${table.status} = 'pending'`),
  ],
);

export type PaymentRow = typeof payments.$inferSelect;
export type NewPaymentRow = typeof payments.$inferInsert;
