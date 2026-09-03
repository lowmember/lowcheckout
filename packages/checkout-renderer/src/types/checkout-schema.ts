/**
 * Configuração declarativa de um checkout.
 *
 * É a única fonte de verdade do visual: template, tema e seções. Tudo que o
 * editor visual manipula, o JSON avançado importa e o renderer desenha sai
 * daqui. Dados de domínio (nome do produto, preço da oferta) NÃO moram neste
 * schema — chegam ao renderer por `CheckoutContent`.
 *
 * A definição vive em `@lowcheckout/contracts` porque a API valida exatamente
 * este documento: reexportamos aqui para preservar o ponto de importação do
 * slice, e para que uma mudança no contrato apareça como erro de tipo no
 * builder em vez de virar 422 em runtime.
 */

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
} from "@lowcheckout/contracts";
export {
  CHECKOUT_SCHEMA_VERSION,
  CHECKOUT_SECTION_TYPES,
  CHECKOUT_TEMPLATE_IDS,
  FONT_FAMILY_IDS,
  SPACING_PRESETS,
  TEXT_ALIGNMENTS,
  TYPE_SCALES,
} from "@lowcheckout/contracts";
