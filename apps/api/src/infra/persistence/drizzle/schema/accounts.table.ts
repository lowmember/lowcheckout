import { sql } from "drizzle-orm";
import { check, pgEnum, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { ACCOUNT_DOCUMENT_TYPES } from "@/domain/accounts/value-objects/account-document-type";
import { ACCOUNT_REVENUE_RANGES } from "@/domain/accounts/value-objects/account-revenue-range";
import { ACCOUNT_STATUSES } from "@/domain/accounts/value-objects/account-status";

export const accountStatus = pgEnum("account_status", ACCOUNT_STATUSES);
export const accountDocumentType = pgEnum("account_document_type", ACCOUNT_DOCUMENT_TYPES);
export const accountRevenueRange = pgEnum("account_revenue_range", ACCOUNT_REVENUE_RANGES);

/**
 * O tenant. Nasce em `pending_onboarding` com os campos de negócio vazios — o
 * onboarding é bloqueante e só depois preenche `business_name`, `document` e
 * `phone`. Daí a nullability: a obrigatoriedade é da invariante (b), não do schema.
 */
export const accounts = pgTable(
  "accounts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    businessName: varchar("business_name", { length: 160 }),
    /** CPF/CNPJ só dígitos; bloqueado para edição pelo usuário (RF-CONF-02). */
    document: varchar("document", { length: 14 }),
    documentType: accountDocumentType("document_type"),
    /** E.164 sem formatação. */
    phone: varchar("phone", { length: 20 }),
    /** E-mail de contato editável — não é o e-mail de login, que vive em `users`. */
    contactEmail: varchar("contact_email", { length: 255 }),
    sellsWhat: varchar("sells_what", { length: 255 }),
    estimatedRevenue: accountRevenueRange("estimated_revenue"),
    status: accountStatus("status").notNull().default("pending_onboarding"),
    onboardingCompletedAt: timestamp("onboarding_completed_at", {
      withTimezone: true,
      mode: "date",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("accounts_document_unique")
      .on(table.document)
      .where(sql`${table.deletedAt} is null`),
    // Invariante (b): conta ativa exige onboarding completo.
    check(
      "accounts_active_requires_onboarding",
      sql`${table.status} <> 'active' or (${table.businessName} is not null and ${table.document} is not null and ${table.phone} is not null)`,
    ),
  ],
);

export type AccountRow = typeof accounts.$inferSelect;
export type NewAccountRow = typeof accounts.$inferInsert;
