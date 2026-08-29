import { z } from "zod";

import { ACCOUNT_DOCUMENT_TYPES } from "@/domain/accounts/value-objects/account-document-type";
import { ACCOUNT_REVENUE_RANGES } from "@/domain/accounts/value-objects/account-revenue-range";

const businessNameSchema = z.string().trim().min(1).max(160);

export const completeOnboardingSchema = z.object({
  businessName: businessNameSchema,
  // Só formato: os dígitos verificadores são conferidos pelo value object `Document`.
  document: z.string().trim().min(11).max(18),
  documentType: z.enum(ACCOUNT_DOCUMENT_TYPES),
  phone: z.string().trim().min(10).max(20),
  sellsWhat: z.string().trim().max(255).nullable().optional(),
  estimatedRevenue: z.enum(ACCOUNT_REVENUE_RANGES).nullable().optional(),
});

/**
 * `strictObject` é o que cumpre RF-CONF-02: mandar `document` por um caminho não
 * previsto pela interface é recusado aqui, com o campo nomeado na resposta.
 */
export const updateAccountSchema = z
  .strictObject({
    businessName: businessNameSchema.optional(),
    contactEmail: z.email({ error: "Informe um e-mail válido" }).nullable().optional(),
    userName: z.string().trim().min(1).max(160).optional(),
  })
  .refine((changes) => Object.values(changes).some((value) => value !== undefined), {
    error: "Informe ao menos um campo para alterar",
  });
