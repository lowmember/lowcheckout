/**
 * Configuração declarativa de um checkout.
 *
 * É a única fonte de verdade do visual: template, tema e seções. Tudo que o
 * editor visual manipula, o JSON avançado importa e o renderer desenha sai
 * daqui. Dados de domínio (nome do produto, preço da oferta) NÃO moram neste
 * schema — chegam ao renderer por `CheckoutContent`.
 */
export const CHECKOUT_SCHEMA_VERSION = 1;

export type CheckoutTemplateId =
  | "blank"
  | "clean"
  | "high-conversion"
  | "infoproduto"
  | "dark"
  | "minimal";

export type CheckoutSectionType =
  | "hero"
  | "product"
  | "benefits"
  | "social-proof"
  | "guarantee"
  | "faq"
  | "checkout-form"
  | "payment-cta"
  | "footer";

/* — Tema global — */

export type SpacingPreset = "compact" | "default" | "spacious";
export type FontFamilyId = "sans" | "grotesk" | "serif" | "mono";
export type TypeScale = "sm" | "md" | "lg";
export type TextAlignment = "left" | "center";

export interface CheckoutThemeColors {
  primary: string;
  primaryText: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
}

export interface CheckoutThemeTypography {
  fontFamily: FontFamilyId;
  headingScale: TypeScale;
  bodyScale: TypeScale;
}

export interface CheckoutThemeRadii {
  base: number;
  button: number;
  input: number;
}

export interface CheckoutTheme {
  colors: CheckoutThemeColors;
  typography: CheckoutThemeTypography;
  radii: CheckoutThemeRadii;
  spacing: SpacingPreset;
}

/* — Props por tipo de seção — */

export interface ListItem {
  id: string;
}

export interface BenefitItem extends ListItem {
  title: string;
  description: string;
}

export interface TestimonialItem extends ListItem {
  name: string;
  role: string;
  quote: string;
  rating: number;
}

export interface FaqItem extends ListItem {
  question: string;
  answer: string;
}

export interface FooterLinkItem extends ListItem {
  label: string;
  url: string;
}

export interface HeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  alignment: TextAlignment;
  showBanner: boolean;
}

export interface ProductProps {
  title: string;
  description: string;
  imageUrl: string;
  badgeLabel: string;
  showPrice: boolean;
}

export interface BenefitsProps {
  title: string;
  subtitle: string;
  items: BenefitItem[];
}

export interface SocialProofProps {
  title: string;
  subtitle: string;
  items: TestimonialItem[];
}

export interface GuaranteeProps {
  title: string;
  description: string;
  days: number;
}

export interface FaqProps {
  title: string;
  items: FaqItem[];
}

export interface CheckoutFormProps {
  title: string;
  description: string;
  showOrderSummary: boolean;
}

export interface PaymentCtaProps {
  label: string;
  helperText: string;
  showSecurityNote: boolean;
}

export interface FooterProps {
  text: string;
  showSecureBadge: boolean;
  links: FooterLinkItem[];
}

export interface CheckoutSectionPropsMap {
  hero: HeroProps;
  product: ProductProps;
  benefits: BenefitsProps;
  "social-proof": SocialProofProps;
  guarantee: GuaranteeProps;
  faq: FaqProps;
  "checkout-form": CheckoutFormProps;
  "payment-cta": PaymentCtaProps;
  footer: FooterProps;
}

/** União discriminada: `section.type` estreita `section.props` no renderer. */
export type CheckoutSection = {
  [TType in CheckoutSectionType]: {
    id: string;
    type: TType;
    enabled: boolean;
    props: CheckoutSectionPropsMap[TType];
  };
}[CheckoutSectionType];

export interface CheckoutSchema {
  version: number;
  template: CheckoutTemplateId;
  theme: CheckoutTheme;
  sections: CheckoutSection[];
}
