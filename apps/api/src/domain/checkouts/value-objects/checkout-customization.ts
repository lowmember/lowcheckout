import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/**
 * Configuração declarativa de um checkout (S9): template, tema e seções.
 *
 * O builder manual (RF-CHK-07) e o "Importar JSON" (RF-CHK-08) são duas
 * interfaces para **este** documento — não existe propriedade livre. Os
 * literais estão duplicados no contrato HTTP de propósito: o domínio não
 * importa nada de fora dele, e `infra/validation/contract-parity.ts` é quem
 * impede que as duas definições divirjam.
 */

/** Um template só: o layout do checkout é decisão do produto, não do lojista. */
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
 * Forma persistida no JSONB e trafegada pela API: a configuração de trabalho
 * (`draft`) e a que a página pública serve (`published`). Não é um sistema de
 * versões — é o par mínimo para "salvar sem publicar" (RF-CHK-07). O histórico
 * continua sendo a revisão gravada a cada escrita.
 */
export interface CheckoutCustomizationProps {
  version: number;
  draft: CheckoutSchema;
  published: CheckoutSchema | null;
  publishedAt: string | null;
}

/** Versão do documento que esta API sabe ler e escrever. */
export const CHECKOUT_CUSTOMIZATION_VERSION = 1;
export const CHECKOUT_SCHEMA_VERSION = 1;

const DEFAULT_THEME: CheckoutTheme = {
  colors: {
    primary: "#2f39d4",
    primaryText: "#ffffff",
    background: "#ededed",
    surface: "#ffffff",
    text: "#1f2024",
    mutedText: "#71717a",
    border: "#e4e4e7",
  },
  typography: {
    fontFamily: "sans",
    headingScale: "md",
    bodyScale: "md",
  },
  radii: {
    base: 10,
    button: 8,
    input: 8,
  },
  spacing: "default",
};

/**
 * Rascunho inicial de um checkout recém-criado.
 *
 * São as seções sem as quais a página pública não existe — formulário e botão
 * de pagamento —, mais produto e rodapé. A criação guiada sobrescreve isto com
 * o template completo logo em seguida; este é o estado intermediário.
 */
function createDefaultSections(): CheckoutSection[] {
  return [
    {
      id: "product",
      type: "product",
      enabled: true,
      props: { title: "", description: "", imageUrl: "", badgeLabel: "", showPrice: true },
    },
    {
      id: "checkout-form",
      type: "checkout-form",
      enabled: true,
      props: {
        title: "Seus dados",
        description: "Preencha para gerar o PIX.",
        showOrderSummary: true,
      },
    },
    {
      id: "payment-cta",
      type: "payment-cta",
      enabled: true,
      props: { label: "Gerar PIX", helperText: "", showSecurityNote: true },
    },
    {
      id: "footer",
      type: "footer",
      enabled: true,
      props: { text: "", showSecureBadge: true, links: [] },
    },
  ];
}

function createDefaultSchema(): CheckoutSchema {
  return {
    version: CHECKOUT_SCHEMA_VERSION,
    template: "default",
    theme: structuredClone(DEFAULT_THEME),
    sections: createDefaultSections(),
  };
}

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/;

const THEME_COLOR_KEYS = [
  "primary",
  "primaryText",
  "background",
  "surface",
  "text",
  "mutedText",
  "border",
] as const;

export class CheckoutCustomization {
  private readonly props: CheckoutCustomizationProps;

  private constructor(props: CheckoutCustomizationProps) {
    this.props = props;
  }

  static default(): CheckoutCustomization {
    return new CheckoutCustomization({
      version: CHECKOUT_CUSTOMIZATION_VERSION,
      draft: createDefaultSchema(),
      published: null,
      publishedAt: null,
    });
  }

  /**
   * Entrada do usuário (builder ou JSON importado). Substituição **total**.
   *
   * A validação campo a campo é do schema na borda HTTP, que devolve o caminho
   * exato do erro para a tela. O que se cobra aqui são as invariantes que
   * sobrevivem a qualquer borda: versão suportada, template e tipo de seção
   * dentro do catálogo, e cor em hexadecimal.
   */
  static create(input: unknown): CheckoutCustomization {
    const document = asRecord(input, "customization");
    const version = readVersion(document.version, CHECKOUT_CUSTOMIZATION_VERSION);
    const publishedAt = document.publishedAt;

    if (publishedAt !== null && publishedAt !== undefined && typeof publishedAt !== "string") {
      throw new InvariantViolationError('"publishedAt" deve ser uma data ISO ou nulo');
    }

    return new CheckoutCustomization({
      version,
      draft: toSchema(document.draft, "draft"),
      published:
        document.published === null || document.published === undefined
          ? null
          : toSchema(document.published, "published"),
      publishedAt: publishedAt ?? null,
    });
  }

  /**
   * Reidratação: tolerante de propósito. A coluna nasce com o default `'{}'` e
   * pode carregar documentos gravados por uma versão anterior do catálogo — o
   * painel precisa abrir mesmo assim. A rigidez fica na escrita, que é onde o
   * usuário recebe o erro.
   */
  static restore(stored: unknown): CheckoutCustomization {
    if (!stored) {
      return CheckoutCustomization.default();
    }

    try {
      return CheckoutCustomization.create(stored);
    } catch {
      return CheckoutCustomization.default();
    }
  }

  toProps(): CheckoutCustomizationProps {
    return structuredClone(this.props);
  }
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new InvariantViolationError(`"${path}" deve ser um objeto`);
  }

  return value as Record<string, unknown>;
}

function readVersion(value: unknown, supported: number): number {
  if (value === undefined) {
    return supported;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new InvariantViolationError('"version" deve ser um inteiro positivo');
  }

  if (value > supported) {
    throw new InvariantViolationError(
      `Documento na versão ${value}; esta API lê até a versão ${supported}`,
    );
  }

  return value;
}

function toSchema(value: unknown, path: string): CheckoutSchema {
  const schema = asRecord(value, path);

  /**
   * Um id fora do catálogo vira o template único em vez de derrubar o
   * documento: o catálogo já teve mais de um template, e um checkout gravado
   * naquela época precisa continuar abrindo com o tema e as seções dele. A
   * recusa de um id inválido é da borda HTTP, onde o usuário vê o erro.
   */
  const template: CheckoutTemplateId = isOneOf(schema.template, CHECKOUT_TEMPLATE_IDS)
    ? schema.template
    : "default";

  if (!Array.isArray(schema.sections)) {
    throw new InvariantViolationError(`"${path}.sections" deve ser uma lista`);
  }

  return {
    version: readVersion(schema.version, CHECKOUT_SCHEMA_VERSION),
    template,
    theme: toTheme(schema.theme, `${path}.theme`),
    sections: schema.sections.map((section, index) =>
      toSection(section, `${path}.sections[${index}]`),
    ),
  };
}

function toTheme(value: unknown, path: string): CheckoutTheme {
  const theme = asRecord(value, path);
  const colors = asRecord(theme.colors, `${path}.colors`);

  for (const key of THEME_COLOR_KEYS) {
    const color = colors[key];

    if (typeof color !== "string" || !HEX_COLOR_PATTERN.test(color.trim().toLowerCase())) {
      throw new InvariantViolationError(
        `"${path}.colors.${key}" deve ser uma cor hexadecimal no formato #rgb ou #rrggbb`,
      );
    }
  }

  return theme as unknown as CheckoutTheme;
}

function toSection(value: unknown, path: string): CheckoutSection {
  const section = asRecord(value, path);

  if (!isOneOf(section.type, CHECKOUT_SECTION_TYPES)) {
    throw new InvariantViolationError(`"${path}.type" está fora do catálogo de seções`);
  }

  if (typeof section.id !== "string" || section.id.trim() === "") {
    throw new InvariantViolationError(`"${path}.id" é obrigatório`);
  }

  if (typeof section.enabled !== "boolean") {
    throw new InvariantViolationError(`"${path}.enabled" deve ser verdadeiro ou falso`);
  }

  asRecord(section.props, `${path}.props`);

  return section as unknown as CheckoutSection;
}

function isOneOf<TValue extends string>(
  value: unknown,
  allowed: readonly TValue[],
): value is TValue {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}
