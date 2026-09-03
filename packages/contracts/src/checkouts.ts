import type { Offer } from "./offers";

export const CHECKOUT_STATUSES = ["draft", "active", "paused", "archived"] as const;
export type CheckoutStatus = (typeof CHECKOUT_STATUSES)[number];

/** Origem de uma revisão de customização — permite reverter um "Importar". */
export const CUSTOMIZATION_SOURCES = ["builder", "json_import", "ai"] as const;
export type CustomizationSource = (typeof CUSTOMIZATION_SOURCES)[number];

export const PIXEL_PROVIDERS = ["facebook", "utmify"] as const;
export type PixelProvider = (typeof PIXEL_PROVIDERS)[number];

/**
 * Configuração declarativa de um checkout: template, tema e seções.
 *
 * É a única fonte de verdade do visual. O editor visual, o "Importar JSON" e o
 * renderer da página pública são três interfaces para **este** documento — não
 * existe propriedade livre no contrato. Dados de domínio (nome do produto,
 * preço da oferta) não moram aqui: chegam ao renderer separadamente.
 */
export const CHECKOUT_SCHEMA_VERSION = 1;

/**
 * Um template só: o layout do checkout é decisão do produto, não do lojista.
 * O enum continua existindo para que o documento diga a qual layout ele
 * pertence — e para que um template novo entre sem quebrar o que está gravado.
 */
export const CHECKOUT_TEMPLATE_IDS = ["default"] as const;
export type CheckoutTemplateId = (typeof CHECKOUT_TEMPLATE_IDS)[number];

export const CHECKOUT_SECTION_TYPES = [
  "countdown",
  "hero",
  "product",
  "benefits",
  "social-proof",
  "guarantee",
  "faq",
  "checkout-form",
  "payment-cta",
  "footer",
] as const;
export type CheckoutSectionType = (typeof CHECKOUT_SECTION_TYPES)[number];

/* — Tema global — */

export const SPACING_PRESETS = ["compact", "default", "spacious"] as const;
export type SpacingPreset = (typeof SPACING_PRESETS)[number];

export const FONT_FAMILY_IDS = ["sans", "grotesk", "serif", "mono"] as const;
export type FontFamilyId = (typeof FONT_FAMILY_IDS)[number];

export const TYPE_SCALES = ["sm", "md", "lg"] as const;
export type TypeScale = (typeof TYPE_SCALES)[number];

export const TEXT_ALIGNMENTS = ["left", "center"] as const;
export type TextAlignment = (typeof TEXT_ALIGNMENTS)[number];

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

export interface CountdownProps {
  message: string;
  expiredMessage: string;
  /** Duração da contagem, reiniciada a cada visita. */
  minutes: number;
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
  countdown: CountdownProps;
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

/**
 * Documento gravado no JSONB `checkout.customization`.
 *
 * Guarda a configuração de trabalho (`draft`, salva a qualquer momento) e a que
 * a página pública serve (`published`). Não é um sistema de versões — é o par
 * mínimo para "salvar sem publicar" (RF-CHK-07). O histórico continua sendo a
 * revisão que a API grava a cada escrita.
 */
export const CHECKOUT_CUSTOMIZATION_VERSION = 1;

export interface CheckoutCustomization {
  version: number;
  draft: CheckoutSchema;
  published: CheckoutSchema | null;
  publishedAt: string | null;
}

export interface Checkout {
  id: string;
  /** Imutável após a criação (RF-CHK-03). */
  productId: string;
  internalTitle: string;
  displayName: string;
  bannerDesktopUrl: string | null;
  bannerMobileUrl: string | null;
  customization: CheckoutCustomization;
  status: CheckoutStatus;
  /** E-mail de contato já confirmado por código; `null` enquanto não houver um. */
  contactEmail: string | null;
  contactEmailVerifiedAt: string | null;
  /** Endereço aguardando confirmação — o comprador ainda não o vê. */
  pendingContactEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Vínculo checkout↔oferta e a URL pública que ele gerou (RF-CHK-05). */
export interface CheckoutOffer {
  id: string;
  checkoutId: string;
  offerId: string;
  productId: string;
  publicSlug: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** O vínculo somado à oferta que ele expõe (RF-CHK-06). */
export interface LinkedOffer extends CheckoutOffer {
  offer: Offer;
}

/**
 * O `accessToken` **nunca** sai da API: ela só informa se existe um gravado.
 * Devolver a credencial de terceiro desfaria o motivo de guardá-la cifrada.
 */
export interface CheckoutPixel {
  id: string;
  checkoutId: string;
  provider: PixelProvider;
  externalId: string;
  hasAccessToken: boolean;
  config: Record<string, unknown>;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
