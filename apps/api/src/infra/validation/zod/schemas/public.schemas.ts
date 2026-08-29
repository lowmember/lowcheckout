import { z } from "zod";

import { GATEWAY_PROVIDERS } from "@/domain/gateways/value-objects/gateway-provider";
import { idSchema } from "@/infra/validation/zod/schemas/shared.schemas";

const publicSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "URL pública inválida");

const visitorIdSchema = z.string().trim().min(1).max(64).nullable().optional();

export const getPublicCheckoutSchema = z.object({
  publicSlug: publicSlugSchema,
  visitorId: visitorIdSchema,
});

/** RF-PUB-02: os três campos são obrigatórios; não há opcional no formulário. */
export const createPublicOrderSchema = z.object({
  publicSlug: publicSlugSchema,
  buyerName: z.string().trim().min(1).max(160),
  buyerEmail: z.email({ error: "Informe um e-mail válido" }),
  // Dígitos verificadores são conferidos pelo value object `Document`.
  buyerDocument: z.string().trim().min(11).max(14),
  visitorId: visitorIdSchema,
});

export const getPublicOrderSchema = z.object({
  orderId: idSchema,
});

export const processPaymentWebhookSchema = z.object({
  provider: z.enum(GATEWAY_PROVIDERS),
  payload: z.record(z.string(), z.unknown()),
});
