/**
 * O renderizador do checkout — uma implementação só, dois consumidores.
 *
 * `apps/web` desenha o preview do builder com ele; `apps/checkout` serve a
 * página que o comprador acessa. O que o lojista vê enquanto edita é
 * literalmente o mesmo componente que vai para a rua, e é essa dependência
 * compartilhada — não uma convenção — que garante isso.
 *
 * O pacote é consumido como código-fonte: quem builda é o Vite de cada app.
 * Por isso ele não tem build próprio, e por isso as classes do Tailwind daqui
 * precisam entrar no `@source` do CSS de quem consome.
 */

/* — Utilitários que as telas do checkout compartilham — */
export { cn } from "./internal/cn";
export { formatCurrency } from "./internal/format-currency";
export { maskCpf, onlyDigits } from "./internal/masks";
export { useCopyToClipboard } from "./internal/use-copy-to-clipboard";
export { formatCountdown, useCountdown } from "./internal/use-countdown";
/* — Schema: normalização, serialização e as regras de publicação — */
export * from "./lib/checkout-schema";
/* — Tema: tokens, presets e as funções de escala que as seções usam — */
export * from "./lib/checkout-theme";
export * from "./lib/create-id";
export * from "./lib/schema-normalizers";
export * from "./lib/section-registry";
export * from "./lib/templates";
/* — Renderizador — */
export * from "./renderer/checkout-renderer";
export * from "./renderer/checkout-theme-shell";
export {
  CHECKOUT_FORM_ID,
  type CheckoutRendererSelection,
  type CheckoutViewport,
  type SelectionDirection,
} from "./renderer/renderer-context";
export * from "./renderer/renderer-primitives";
/* — Telas pós-formulário: mesmo tema, mesmo pacote (RF-PUB-04 e RF-PUB-06) — */
export * from "./screens/pix-payment-screen";
export * from "./screens/thank-you-screen";
/* — Tipos — */
export * from "./types/checkout-buyer";
export * from "./types/checkout-content";
export type {
  BenefitItem,
  BenefitsProps,
  CheckoutFormProps,
  CheckoutSchema,
  CheckoutSection,
  CheckoutSectionPropsMap,
  CheckoutSectionType,
  CheckoutTemplateId,
  CheckoutTheme,
  CheckoutThemeColors,
  CheckoutThemeRadii,
  CheckoutThemeTypography,
  CountdownProps,
  FaqItem,
  FaqProps,
  FontFamilyId,
  FooterLinkItem,
  FooterProps,
  GuaranteeProps,
  HeroProps,
  ListItem,
  PaymentCtaProps,
  ProductProps,
  SocialProofProps,
  SpacingPreset,
  TestimonialItem,
  TextAlignment,
  TypeScale,
} from "./types/checkout-schema";
/**
 * `FONT_FAMILY_IDS`, `TYPE_SCALES` e `SPACING_PRESETS` ficam de fora: o
 * catálogo de tema já os exporta, e `export *` descarta nome ambíguo em
 * silêncio. A lista explícita é o que impede o buraco.
 */
export {
  CHECKOUT_SCHEMA_VERSION,
  CHECKOUT_SECTION_TYPES,
  CHECKOUT_TEMPLATE_IDS,
  TEXT_ALIGNMENTS,
} from "./types/checkout-schema";
export * from "./types/customization";
