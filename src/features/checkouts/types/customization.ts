import type { CheckoutSchema } from "@/features/checkouts/types/checkout-schema";

export const CHECKOUT_CUSTOMIZATION_VERSION = 1;

/**
 * Documento gravado no JSONB `checkout.customization`.
 *
 * Guarda duas configurações: a de trabalho (`draft`, salva a qualquer momento)
 * e a que a página pública serve (`published`). Não é um sistema de versões —
 * é o par mínimo para "salvar sem publicar" (RF-CHK-07). O histórico continua
 * sendo a revisão que a API grava a cada escrita.
 *
 * TODO(contrato): a API validava o catálogo plano antigo com `strictObject`.
 * Ela precisa aceitar este documento aninhado para a experiência de templates
 * + seções existir. O envelope da requisição (`{ customization, source }`) e a
 * gravação de revisões continuam exatamente iguais.
 */
export interface CheckoutCustomization {
  version: number;
  draft: CheckoutSchema;
  published: CheckoutSchema | null;
  publishedAt: string | null;
}

/**
 * Origem da escrita. A API grava uma revisão em `checkout_customization_revisions`
 * com esse `source`, e é ele que permite reverter um "Importar" (RF-CHK-08).
 */
export type CustomizationSource = "builder" | "json_import";
