import { z } from "zod";

import {
  CHECKOUT_STATUSES,
  CHECKOUT_TEMPLATE_IDS,
  type CheckoutCustomization,
  type CheckoutSchema,
  type CheckoutSectionType,
  CUSTOMIZATION_SOURCES,
  FONT_FAMILY_IDS,
  PIXEL_PROVIDERS,
  SPACING_PRESETS,
  TEXT_ALIGNMENTS,
  TYPE_SCALES,
} from "../checkouts";
import { idSchema, optionalUrlSchema, paginationSchema } from "./shared.schemas";

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

/* — E-mail de contato do checkout (RF-CHK-11) — */

export const requestCheckoutContactEmailVerificationSchema = z.object({
  checkoutId: idSchema,
  contactEmail: z.email().max(255),
});

export const confirmCheckoutContactEmailSchema = z.object({
  checkoutId: idSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { error: "O código tem 6 dígitos" }),
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

/* — Documento de customização (RF-CHK-07/08) — */

/**
 * O documento é validado por inteiro aqui: tema, seções e os props de cada tipo
 * de seção. É a fronteira onde um "Importar JSON" malformado é recusado com o
 * caminho exato do campo, antes de qualquer alteração de estado. Os tipos de
 * `../checkouts` são a declaração; a trava no fim do arquivo impede que as duas
 * definições divirjam sem quebrar o `typecheck`.
 */
const hexColorSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/, {
    error: "Informe uma cor hexadecimal no formato #rgb ou #rrggbb",
  });

/** Texto livre de conteúdo do checkout. Vazio é permitido: significa "não exibir". */
const contentTextSchema = z.string().max(2000);

/** URL de imagem opcional dentro do documento — `""` é o estado "sem imagem". */
const imageUrlSchema = z.union([z.literal(""), z.url()]);

const itemIdSchema = z.string().trim().min(1).max(120);

const checkoutThemeSchema = z.object({
  colors: z.object({
    primary: hexColorSchema,
    primaryText: hexColorSchema,
    background: hexColorSchema,
    surface: hexColorSchema,
    text: hexColorSchema,
    mutedText: hexColorSchema,
    border: hexColorSchema,
  }),
  typography: z.object({
    fontFamily: z.enum(FONT_FAMILY_IDS),
    headingScale: z.enum(TYPE_SCALES),
    bodyScale: z.enum(TYPE_SCALES),
  }),
  radii: z.object({
    base: z.number().int().min(0).max(64),
    button: z.number().int().min(0).max(64),
    input: z.number().int().min(0).max(64),
  }),
  spacing: z.enum(SPACING_PRESETS),
});

const heroPropsSchema = z.object({
  eyebrow: contentTextSchema,
  title: contentTextSchema,
  subtitle: contentTextSchema,
  imageUrl: imageUrlSchema,
  alignment: z.enum(TEXT_ALIGNMENTS),
  showBanner: z.boolean(),
});

const productPropsSchema = z.object({
  title: contentTextSchema,
  description: contentTextSchema,
  imageUrl: imageUrlSchema,
  badgeLabel: contentTextSchema,
  showPrice: z.boolean(),
});

const benefitsPropsSchema = z.object({
  title: contentTextSchema,
  subtitle: contentTextSchema,
  items: z
    .array(
      z.object({
        id: itemIdSchema,
        title: contentTextSchema,
        description: contentTextSchema,
      }),
    )
    .max(24),
});

const socialProofPropsSchema = z.object({
  title: contentTextSchema,
  subtitle: contentTextSchema,
  items: z
    .array(
      z.object({
        id: itemIdSchema,
        name: contentTextSchema,
        role: contentTextSchema,
        quote: contentTextSchema,
        rating: z.number().int().min(0).max(5),
      }),
    )
    .max(24),
});

const guaranteePropsSchema = z.object({
  title: contentTextSchema,
  description: contentTextSchema,
  days: z.number().int().min(0).max(365),
});

const faqPropsSchema = z.object({
  title: contentTextSchema,
  items: z
    .array(
      z.object({
        id: itemIdSchema,
        question: contentTextSchema,
        answer: contentTextSchema,
      }),
    )
    .max(24),
});

const checkoutFormPropsSchema = z.object({
  title: contentTextSchema,
  description: contentTextSchema,
  showOrderSummary: z.boolean(),
});

const paymentCtaPropsSchema = z.object({
  label: contentTextSchema,
  helperText: contentTextSchema,
  showSecurityNote: z.boolean(),
});

const footerPropsSchema = z.object({
  text: contentTextSchema,
  showSecureBadge: z.boolean(),
  links: z
    .array(
      z.object({
        id: itemIdSchema,
        label: contentTextSchema,
        url: contentTextSchema,
      }),
    )
    .max(12),
});

function sectionSchema<TType extends CheckoutSectionType, TProps extends z.ZodTypeAny>(
  type: TType,
  props: TProps,
) {
  return z.object({
    id: itemIdSchema,
    type: z.literal(type),
    enabled: z.boolean(),
    props,
  });
}

/** `type` é o discriminante: o zod aponta o erro dentro do props certo. */
const checkoutSectionSchema = z.discriminatedUnion("type", [
  sectionSchema("hero", heroPropsSchema),
  sectionSchema("product", productPropsSchema),
  sectionSchema("benefits", benefitsPropsSchema),
  sectionSchema("social-proof", socialProofPropsSchema),
  sectionSchema("guarantee", guaranteePropsSchema),
  sectionSchema("faq", faqPropsSchema),
  sectionSchema("checkout-form", checkoutFormPropsSchema),
  sectionSchema("payment-cta", paymentCtaPropsSchema),
  sectionSchema("footer", footerPropsSchema),
]);

export const checkoutSchemaDocumentSchema = z.object({
  version: z.number().int().positive(),
  template: z.enum(CHECKOUT_TEMPLATE_IDS),
  theme: checkoutThemeSchema,
  sections: z.array(checkoutSectionSchema).max(40),
});

const customizationDocumentSchema = z.object({
  version: z.number().int().positive(),
  draft: checkoutSchemaDocumentSchema,
  published: checkoutSchemaDocumentSchema.nullable(),
  publishedAt: z.iso.datetime({ offset: true }).nullable(),
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

export type RequestCheckoutContactEmailVerificationInput = z.input<
  typeof requestCheckoutContactEmailVerificationSchema
>;
export type ConfirmCheckoutContactEmailInput = z.input<typeof confirmCheckoutContactEmailSchema>;

export type ListCheckoutsParams = z.input<typeof listCheckoutsSchema>;
export type CreateCheckoutInput = z.input<typeof createCheckoutSchema>;
export type UpdateCheckoutInput = z.input<typeof updateCheckoutSchema>;
export type UpdateCheckoutCustomizationInput = z.input<typeof updateCheckoutCustomizationSchema>;
export type ReplaceCheckoutPixelsInput = z.input<typeof replaceCheckoutPixelsSchema>;
export type CheckoutPixelInput = ReplaceCheckoutPixelsInput["pixels"][number];

/**
 * Trava de paridade entre o zod e os tipos de `../checkouts`.
 *
 * O documento é declarado duas vezes — como interface (que o web e a API usam)
 * e como schema (que valida a entrada). Estas duas linhas transformam qualquer
 * divergência entre elas em erro de `typecheck`, em vez de um 422 em produção.
 */
export type CheckoutSchemaParity =
  z.infer<typeof checkoutSchemaDocumentSchema> extends CheckoutSchema
    ? CheckoutSchema extends z.infer<typeof checkoutSchemaDocumentSchema>
      ? true
      : never
    : never;

export type CheckoutCustomizationParity =
  z.infer<typeof customizationDocumentSchema> extends CheckoutCustomization
    ? CheckoutCustomization extends z.infer<typeof customizationDocumentSchema>
      ? true
      : never
    : never;

export type CheckoutSchemaDocument = z.infer<typeof checkoutSchemaDocumentSchema>;
