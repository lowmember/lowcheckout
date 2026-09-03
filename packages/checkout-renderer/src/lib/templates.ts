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
 * O template é uma instância do mesmo schema declarativo — não HTML estático.
 * Aplicá-lo é só clonar um objeto; nada no renderer conhece o id dele.
 *
 * Existe um só de propósito: o layout do checkout é decisão de produto, e uma
 * página de pagamento boa é a mesma página em qualquer nicho. O que varia fica
 * no tema e nas seções, que o lojista edita.
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

/**
 * Uma coluna só, de cima a baixo: urgência, banner, produto, dados, pagamento.
 * O comprador nunca precisa rolar para trás para entender o que está comprando
 * — e o que ele lê logo acima do botão é o resumo do pedido.
 */
const defaultTemplate: CheckoutTemplate = {
  id: "default",
  name: "Checkout LowCheckout",
  description:
    "Coluna única com barra de urgência, banner, resumo da oferta, dados do comprador e pagamento — na ordem em que a decisão de compra acontece.",
  tags: ["Conversão", "Coluna única"],
  createSchema: () =>
    schema("default", theme({}), [
      section("countdown"),
      section("hero", { title: "", subtitle: "", eyebrow: "" }),
      section("product"),
      section("checkout-form", { title: "", description: "" }),
      section("payment-cta", {
        label: "Comprar agora",
        helperText:
          'Ao clicar em "Comprar agora", você declara que leu e concorda com os termos de compra e a política de privacidade. O pagamento é processado via PIX, com confirmação imediata.',
      }),
      section("social-proof", { title: "", subtitle: "" }),
      section("footer", { showSecureBadge: false }),
    ]),
};

export const CHECKOUT_TEMPLATES: CheckoutTemplate[] = [defaultTemplate];

export const DEFAULT_TEMPLATE = defaultTemplate;

export function getCheckoutTemplate(id: CheckoutTemplateId) {
  return CHECKOUT_TEMPLATES.find((template) => template.id === id);
}

export function createTemplateSchema(id: CheckoutTemplateId): CheckoutSchema {
  return (getCheckoutTemplate(id) ?? defaultTemplate).createSchema();
}

/**
 * Migração da customização plana anterior (catálogo de cores + textos soltos).
 * Um checkout salvo antes do schema declarativo abre no editor sem perder cor
 * nem texto.
 */
export function createLegacySchema(raw: Record<string, unknown>): CheckoutSchema {
  const base = defaultTemplate.createSchema();

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
