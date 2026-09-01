import {
  CHECKOUT_SCHEMA_VERSION,
  type CheckoutSchema,
  type CheckoutSection,
  type CheckoutSectionPropsMap,
  type CheckoutSectionType,
  type CheckoutTemplateId,
  type CheckoutTheme,
} from "../types/checkout-schema";
import { DEFAULT_THEME, isHexColor } from "./checkout-theme";
import { createLocalId } from "./create-id";
import { createSection } from "./section-registry";

/**
 * Templates são instâncias do mesmo schema declarativo — não HTML estático.
 * Escolher um template é só clonar um objeto; nada no renderer conhece o id de
 * um template específico.
 */

function section<TType extends CheckoutSectionType>(
  type: TType,
  props: Partial<CheckoutSectionPropsMap[TType]> = {},
): CheckoutSection {
  const base = createSection(type);
  return { ...base, props: { ...base.props, ...props } } as CheckoutSection;
}

interface ThemeOverrides {
  colors?: Partial<CheckoutTheme["colors"]>;
  typography?: Partial<CheckoutTheme["typography"]>;
  radii?: Partial<CheckoutTheme["radii"]>;
  spacing?: CheckoutTheme["spacing"];
}

function theme(overrides: ThemeOverrides): CheckoutTheme {
  return {
    colors: { ...DEFAULT_THEME.colors, ...overrides.colors },
    typography: { ...DEFAULT_THEME.typography, ...overrides.typography },
    radii: { ...DEFAULT_THEME.radii, ...overrides.radii },
    spacing: overrides.spacing ?? DEFAULT_THEME.spacing,
  };
}

function schema(
  template: CheckoutTemplateId,
  themeValue: CheckoutTheme,
  sections: CheckoutSection[],
): CheckoutSchema {
  return { version: CHECKOUT_SCHEMA_VERSION, template, theme: themeValue, sections };
}

export interface CheckoutTemplate {
  id: CheckoutTemplateId;
  name: string;
  description: string;
  tags: string[];
  createSchema: () => CheckoutSchema;
}

const blank: CheckoutTemplate = {
  id: "blank",
  name: "Começar do zero",
  description: "Só o essencial: formulário do comprador e botão de PIX. Você monta o resto.",
  tags: ["Essencial"],
  createSchema: () =>
    schema("blank", theme({}), [
      section("product"),
      section("checkout-form"),
      section("payment-cta"),
      section("footer"),
    ]),
};

const clean: CheckoutTemplate = {
  id: "clean",
  name: "Clean",
  description: "Minimalista, muito espaço em branco e foco total no produto.",
  tags: ["Minimalista", "Produto físico"],
  createSchema: () =>
    schema(
      "clean",
      theme({
        colors: {
          primary: "#111111",
          primaryText: "#ffffff",
          background: "#ffffff",
          surface: "#ffffff",
          text: "#111111",
          mutedText: "#8a8a8a",
          border: "#ededed",
        },
        radii: { base: 16, button: 12, input: 12 },
        spacing: "spacious",
      }),
      [
        section("hero", {
          title: "Finalize sua compra",
          subtitle: "Leva menos de um minuto. Pagamento por PIX com confirmação imediata.",
          alignment: "left",
          showBanner: false,
        }),
        section("product", { badgeLabel: "" }),
        section("checkout-form", { title: "Seus dados", description: "" }),
        section("payment-cta", { label: "Pagar com PIX" }),
        section("footer"),
      ],
    ),
};

const highConversion: CheckoutTemplate = {
  id: "high-conversion",
  name: "High Conversion",
  description: "Estrutura completa de venda: prova social, garantia e FAQ antes do pagamento.",
  tags: ["Conversão", "Página longa"],
  createSchema: () =>
    schema(
      "high-conversion",
      theme({
        colors: {
          primary: "#6c4bf4",
          primaryText: "#ffffff",
          background: "#f6f4ff",
          surface: "#ffffff",
          text: "#14121f",
          mutedText: "#6b6880",
          border: "#e6e1fb",
        },
        typography: { fontFamily: "grotesk", headingScale: "lg" },
        radii: { base: 14, button: 999, input: 10 },
      }),
      [
        section("hero", {
          eyebrow: "Vagas limitadas",
          title: "Comece hoje e veja resultado na primeira semana",
          subtitle: "Mais de 3.000 alunos já passaram por este método. Acesso imediato via PIX.",
          alignment: "center",
        }),
        section("product", { badgeLabel: "Mais vendido" }),
        section("benefits", { title: "Tudo que está incluso" }),
        section("social-proof", { title: "O que dizem os alunos" }),
        section("guarantee", { days: 7 }),
        section("faq"),
        section("checkout-form", {
          title: "Falta pouco",
          description: "Preencha seus dados e gere o PIX.",
        }),
        section("payment-cta", {
          label: "Quero garantir minha vaga",
          helperText: "Acesso liberado automaticamente após a confirmação.",
        }),
        section("footer"),
      ],
    ),
};

const infoproduto: CheckoutTemplate = {
  id: "infoproduto",
  name: "Infoproduto",
  description: "Pensado para cursos, ebooks e produtos digitais, com entrega e benefícios claros.",
  tags: ["Curso", "Ebook"],
  createSchema: () =>
    schema(
      "infoproduto",
      theme({
        colors: {
          primary: "#ea580c",
          primaryText: "#ffffff",
          background: "#fdf8f3",
          surface: "#ffffff",
          text: "#1c1917",
          mutedText: "#7c7268",
          border: "#eee0d3",
        },
        typography: { fontFamily: "serif", headingScale: "lg" },
        radii: { base: 18, button: 14, input: 12 },
        spacing: "spacious",
      }),
      [
        section("hero", {
          eyebrow: "Curso online",
          title: "Do zero ao primeiro resultado, no seu ritmo",
          subtitle: "Aulas gravadas, material de apoio e comunidade — com acesso vitalício.",
          alignment: "center",
        }),
        section("product", { badgeLabel: "Acesso vitalício" }),
        section("benefits", {
          title: "O que você recebe ao entrar",
          subtitle: "Tudo liberado no mesmo instante em que o PIX é confirmado.",
        }),
        section("checkout-form", { title: "Seus dados de acesso" }),
        section("payment-cta", {
          label: "Quero começar agora",
          helperText: "Você recebe o acesso no e-mail informado acima.",
        }),
        section("social-proof", { title: "Histórias de quem já fez" }),
        section("faq"),
        section("footer"),
      ],
    ),
};

const dark: CheckoutTemplate = {
  id: "dark",
  name: "Dark",
  description: "Estética escura e moderna, com contraste alto e leitura confortável.",
  tags: ["Moderno", "Tech"],
  createSchema: () =>
    schema(
      "dark",
      theme({
        colors: {
          primary: "#a3e635",
          primaryText: "#0a0a0a",
          background: "#0a0a0a",
          surface: "#151515",
          text: "#fafafa",
          mutedText: "#a1a1aa",
          border: "#262626",
        },
        typography: { fontFamily: "grotesk", headingScale: "lg" },
        radii: { base: 10, button: 8, input: 8 },
      }),
      [
        section("hero", {
          eyebrow: "Edição 2026",
          title: "Assine e destrave o acesso completo",
          subtitle: "Sem mensalidade. Um pagamento, acesso permanente.",
          alignment: "left",
        }),
        section("product", { badgeLabel: "Novo" }),
        section("benefits", { title: "Incluído no acesso" }),
        section("social-proof", { title: "Quem já está dentro" }),
        section("checkout-form", { title: "Dados do comprador", description: "" }),
        section("payment-cta", { label: "Gerar PIX", helperText: "" }),
        section("footer"),
      ],
    ),
};

const minimal: CheckoutTemplate = {
  id: "minimal",
  name: "Minimal",
  description: "Direto ao ponto: produto, dados e pagamento em uma dobra só.",
  tags: ["Rápido", "Uma dobra"],
  createSchema: () =>
    schema(
      "minimal",
      theme({
        colors: {
          primary: "#111111",
          primaryText: "#ffffff",
          background: "#f4f4f5",
          surface: "#ffffff",
          text: "#18181b",
          mutedText: "#71717a",
          border: "#e4e4e7",
        },
        typography: { headingScale: "sm", bodyScale: "sm" },
        radii: { base: 4, button: 4, input: 4 },
        spacing: "compact",
      }),
      [
        section("product", { badgeLabel: "" }),
        section("checkout-form", { title: "Dados", description: "", showOrderSummary: false }),
        section("payment-cta", { label: "Gerar PIX", showSecurityNote: false }),
        section("footer", { showSecureBadge: false }),
      ],
    ),
};

export const CHECKOUT_TEMPLATES: CheckoutTemplate[] = [
  clean,
  highConversion,
  infoproduto,
  dark,
  minimal,
];

export const BLANK_TEMPLATE = blank;

export function getCheckoutTemplate(id: CheckoutTemplateId) {
  return [blank, ...CHECKOUT_TEMPLATES].find((template) => template.id === id);
}

export function createTemplateSchema(id: CheckoutTemplateId): CheckoutSchema {
  return (getCheckoutTemplate(id) ?? blank).createSchema();
}

/**
 * Migração da customização plana anterior (catálogo de cores + textos soltos).
 * Um checkout salvo antes do schema declarativo abre no editor sem perder cor
 * nem texto.
 */
export function createLegacySchema(raw: Record<string, unknown>): CheckoutSchema {
  const base = clean.createSchema();

  function color(key: string, fallback: string) {
    const value = raw[key];
    return typeof value === "string" && isHexColor(value) ? value : fallback;
  }

  function text(key: string) {
    const value = raw[key];
    return typeof value === "string" && value.trim().length > 0 ? value : null;
  }

  const legacyTheme = theme({
    colors: {
      primary: color("buttonColor", color("primaryColor", DEFAULT_THEME.colors.primary)),
      primaryText: color("buttonTextColor", DEFAULT_THEME.colors.primaryText),
      background: color("backgroundColor", DEFAULT_THEME.colors.background),
      surface: color("surfaceColor", DEFAULT_THEME.colors.surface),
      text: color("textColor", DEFAULT_THEME.colors.text),
      mutedText: color("mutedTextColor", DEFAULT_THEME.colors.mutedText),
    },
  });

  const headline = text("headline");
  const subheadline = text("subheadline");
  const ctaLabel = text("ctaLabel");
  const footerText = text("footerText");
  const showSecureBadge = raw.showSecureBadge;

  return {
    ...base,
    template: "clean",
    theme: legacyTheme,
    sections: base.sections.map((current) => {
      if (current.type === "hero") {
        return {
          ...current,
          props: {
            ...current.props,
            title: headline ?? current.props.title,
            subtitle: subheadline ?? current.props.subtitle,
          },
        };
      }

      if (current.type === "payment-cta") {
        return { ...current, props: { ...current.props, label: ctaLabel ?? current.props.label } };
      }

      if (current.type === "footer") {
        return {
          ...current,
          props: {
            ...current.props,
            text: footerText ?? current.props.text,
            showSecureBadge:
              typeof showSecureBadge === "boolean"
                ? showSecureBadge
                : current.props.showSecureBadge,
          },
        };
      }

      return current;
    }),
  };
}

/** Ids novos a cada clone de template — evita colisão entre checkouts. */
export function withFreshSectionIds(value: CheckoutSchema): CheckoutSchema {
  return {
    ...value,
    sections: value.sections.map((current) => ({ ...current, id: createLocalId(current.type) })),
  };
}
