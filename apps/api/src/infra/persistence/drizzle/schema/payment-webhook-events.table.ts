import { jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { PAYMENT_WEBHOOK_EVENT_STATUSES } from "@/domain/payments/value-objects/payment-webhook-event-status";
import { gatewayProvider } from "@/infra/persistence/drizzle/schema/gateway-connections.table";
import { payments } from "@/infra/persistence/drizzle/schema/payments.table";

export const paymentWebhookEventStatus = pgEnum(
  "payment_webhook_event_status",
  PAYMENT_WEBHOOK_EVENT_STATUSES,
);

/**
 * É o `unique(provider, external_event_id)` que torna o webhook idempotente
 * (RF-GTW-02): a reentrega do gateway colide no insert e é descartada antes de
 * tocar o pedido. `payment_id` é nulo porque nem todo evento casa com um
 * pagamento conhecido.
 */
export const paymentWebhookEvents = pgTable(
  "payment_webhook_events",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    provider: gatewayProvider("provider").notNull(),
    externalEventId: varchar("external_event_id", { length: 160 }).notNull(),
    paymentId: varchar("payment_id", { length: 36 }).references(() => payments.id, {
      onDelete: "set null",
    }),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    status: paymentWebhookEventStatus("status").notNull().default("received"),
    error: text("error"),
    receivedAt: timestamp("received_at", { withTimezone: true, mode: "date" }).notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("payment_webhook_events_provider_external_event_id_unique").on(
      table.provider,
      table.externalEventId,
    ),
  ],
);

export type PaymentWebhookEventRow = typeof paymentWebhookEvents.$inferSelect;
export type NewPaymentWebhookEventRow = typeof paymentWebhookEvents.$inferInsert;
