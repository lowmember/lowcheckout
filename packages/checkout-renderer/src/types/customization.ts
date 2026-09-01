/**
 * Documento gravado no JSONB `checkout.customization`.
 *
 * Guarda duas configurações: a de trabalho (`draft`, salva a qualquer momento)
 * e a que a página pública serve (`published`). Não é um sistema de versões —
 * é o par mínimo para "salvar sem publicar" (RF-CHK-07). O histórico continua
 * sendo a revisão que a API grava a cada escrita.
 *
 * A definição vive em `@lowcheckout/contracts`: é o mesmo documento que
 * `PUT /checkouts/{id}/customization` valida por inteiro.
 */

export type { CheckoutCustomization } from "@lowcheckout/contracts";
export { CHECKOUT_CUSTOMIZATION_VERSION } from "@lowcheckout/contracts";

/**
 * Origem da escrita. A API grava uma revisão em `checkout_customization_revisions`
 * com esse `source`, e é ele que permite reverter um "Importar" (RF-CHK-08).
 *
 * O contrato também aceita `"ai"`, que o builder ainda não produz — o slice
 * expõe só o que ele sabe enviar.
 */
export type CustomizationSource = "builder" | "json_import";
