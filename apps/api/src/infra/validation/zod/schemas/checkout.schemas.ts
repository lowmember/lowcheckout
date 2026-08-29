import { z } from "zod";

import {
  CHECKOUT_CUSTOMIZATION_COLOR_KEYS,
  CHECKOUT_CUSTOMIZATION_FLAG_KEYS,
  CHECKOUT_CUSTOMIZATION_TEXT_KEYS,
} from "@/domain/checkouts/value-objects/checkout-customization";
import { CHECKOUT_STATUSES } from "@/domain/checkouts/value-objects/checkout-status";
import { CUSTOMIZATION_SOURCES } from "@/domain/checkouts/value-objects/customization-source";
import { PIXEL_PROVIDERS } from "@/domain/checkouts/value-objects/pixel-provider";
import {
  idSchema,
  optionalUrlSchema,
  paginationSchema,
} from "@/infra/validation/zod/schemas/shared.schemas";

const checkoutStatusSchema = z.enum(CHECKOUT_STATUSES);
const checkoutTitleSchema = z.string().trim().min(1).max(120);

export const listCheckoutsSchema = paginationSchema.extend({
  status: checkoutStatusSchema.optional(),
  productId: idSchema.optional(),
  search: z.string().trim().min(1).optional(),
});

export const getCheckoutSchema = z.object({
  checkoutId: idSchema,
});

export const createCheckoutSchema = z.object({
  productId: idSchema,
  internalTitle: checkoutTitleSchema,
  displayName: checkoutTitleSchema,
  bannerDesktopUrl: optionalUrlSchema,
  bannerMobileUrl: optionalUrlSchema,
});

/** `productId` fica de fora: o produto é imutável após a criação (RF-CHK-03). */
export const updateCheckoutSchema = z
  .object({
    checkoutId: idSchema,
    internalTitle: checkoutTitleSchema.optional(),
    displayName: checkoutTitleSchema.optional(),
    bannerDesktopUrl: optionalUrlSchema,
    bannerMobileUrl: optionalUrlSchema,
    status: checkoutStatusSchema.optional(),
  })
  .refine(
    ({ checkoutId: _checkoutId, ...changes }) =>
      Object.values(changes).some((value) => value !== undefined),
    { error: "Informe ao menos um campo para alterar" },
  );

export const deleteCheckoutSchema = z.object({
  checkoutId: idSchema,
});

export const linkOfferToCheckoutSchema = z.object({
  checkoutId: idSchema,
  offerId: idSchema,
});

export const unlinkOfferFromCheckoutSchema = z.object({
  checkoutId: idSchema,
  offerId: idSchema,
});

export const listCheckoutOffersSchema = z.object({
  checkoutId: idSchema,
});

/**
 * O zod só garante o **formato** do documento de customização: as chaves são as
 * do catálogo e nenhuma outra. Cor válida, tamanho de texto e demais regras são
 * do value object `CheckoutCustomization`.
 */
const customizationDocumentSchema = z.strictObject({
  ...Object.fromEntries(
    CHECKOUT_CUSTOMIZATION_COLOR_KEYS.map((key) => [key, z.string().optional()]),
  ),
  ...Object.fromEntries(
    CHECKOUT_CUSTOMIZATION_TEXT_KEYS.map((key) => [key, z.string().nullable().optional()]),
  ),
  ...Object.fromEntries(
    CHECKOUT_CUSTOMIZATION_FLAG_KEYS.map((key) => [key, z.boolean().optional()]),
  ),
});

export const updateCheckoutCustomizationSchema = z.object({
  checkoutId: idSchema,
  source: z.enum(CUSTOMIZATION_SOURCES),
  customization: customizationDocumentSchema,
});

export const listCheckoutPixelsSchema = z.object({
  checkoutId: idSchema,
});

export const replaceCheckoutPixelsSchema = z.object({
  checkoutId: idSchema,
  pixels: z
    .array(
      z.object({
        provider: z.enum(PIXEL_PROVIDERS),
        externalId: z.string().trim().min(1).max(120),
        accessToken: z.string().trim().min(1).nullable().optional(),
        config: z.record(z.string(), z.unknown()).nullable().optional(),
        isEnabled: z.boolean().optional(),
      }),
    )
    .max(PIXEL_PROVIDERS.length),
});
