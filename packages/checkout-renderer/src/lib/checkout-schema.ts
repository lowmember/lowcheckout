import {
  CHECKOUT_SCHEMA_VERSION,
  type CheckoutSchema,
  type CheckoutSection,
  type CheckoutSectionType,
  type CheckoutTemplateId,
} from "../types/checkout-schema";
import { CHECKOUT_CUSTOMIZATION_VERSION, type CheckoutCustomization } from "../types/customization";
import { isHexColor, normalizeTheme } from "./checkout-theme";
import { createLocalId } from "./create-id";
import { isRecord } from "./schema-normalizers";
import { getSectionDefinition, SECTION_REGISTRY } from "./section-registry";
import { createLegacySchema, createTemplateSchema } from "./templates";

const TEMPLATE_IDS: CheckoutTemplateId[] = [
  "blank",
  "clean",
  "high-conversion",
  "infoproduto",
  "dark",
  "minimal",
];

const SCHEMA_KEYS = ["version", "template", "theme", "sections"];
const SECTION_KEYS = ["id", "type", "enabled", "props"];
const LEGACY_KEYS = ["primaryColor", "backgroundColor", "buttonColor", "ctaLabel", "headline"];

function isSectionType(value: unknown): value is CheckoutSectionType {
  return typeof value === "string" && value in SECTION_REGISTRY;
}

/* — Leitura tolerante (API, cache, versão anterior) — */

function normalizeSection(raw: Record<string, unknown>): CheckoutSection | null {
  if (!isSectionType(raw.type)) return null;

  const definition = getSectionDefinition(raw.type);
  const props = isRecord(raw.props) ? raw.props : {};

  return {
    id: typeof raw.id === "string" && raw.id.length > 0 ? raw.id : createLocalId(raw.type),
    type: raw.type,
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : true,
    props: definition.normalizeProps(props),
  } as CheckoutSection;
}

export function normalizeSchema(raw: unknown): CheckoutSchema {
  if (!isRecord(raw)) return createTemplateSchema("blank");

  const template = TEMPLATE_IDS.includes(raw.template as CheckoutTemplateId)
    ? (raw.template as CheckoutTemplateId)
    : "blank";

  const sections = Array.isArray(raw.sections)
    ? raw.sections
        .filter(isRecord)
        .map(normalizeSection)
        .filter((section): section is CheckoutSection => section !== null)
    : [];

  return {
    version: CHECKOUT_SCHEMA_VERSION,
    template,
    theme: normalizeTheme(raw.theme),
    sections,
  };
}

/**
 * Lê o JSONB `checkout.customization` em qualquer formato que ele possa ter:
 * o envelope atual, um schema solto ou a customização plana anterior.
 *
 * A entrada é `unknown` de propósito. O contrato promete `CheckoutCustomization`,
 * mas o valor vem de uma coluna JSONB que nasceu com default `'{}'` e pode
 * guardar documento de uma versão anterior do catálogo — tipar mais forte do que
 * a realidade só empurraria a checagem para o `structuredClone` do renderer.
 */
export function toCustomization(raw: unknown): CheckoutCustomization {
  const empty: CheckoutCustomization = {
    version: CHECKOUT_CUSTOMIZATION_VERSION,
    draft: createTemplateSchema("blank"),
    published: null,
    publishedAt: null,
  };

  if (!isRecord(raw) || Object.keys(raw).length === 0) return empty;

  if (isRecord(raw.draft)) {
    return {
      version: CHECKOUT_CUSTOMIZATION_VERSION,
      draft: normalizeSchema(raw.draft),
      published: isRecord(raw.published) ? normalizeSchema(raw.published) : null,
      publishedAt: typeof raw.publishedAt === "string" ? raw.publishedAt : null,
    };
  }

  if (Array.isArray(raw.sections)) {
    return { ...empty, draft: normalizeSchema(raw) };
  }

  if (LEGACY_KEYS.some((key) => key in raw)) {
    return { ...empty, draft: createLegacySchema(raw) };
  }

  return empty;
}

/* — JSON avançado (RF-CHK-08) — */

export function toSchemaJson(schema: CheckoutSchema) {
  return JSON.stringify(schema, null, 2);
}

export interface SchemaParseResult {
  schema?: CheckoutSchema;
  error?: string;
}

function validateSectionShape(value: unknown, index: number): string | null {
  if (!isRecord(value)) return `A seção #${index + 1} precisa ser um objeto.`;

  const unknownKeys = Object.keys(value).filter((key) => !SECTION_KEYS.includes(key));
  if (unknownKeys.length > 0) {
    return `A seção #${index + 1} tem propriedade não suportada: ${unknownKeys.join(", ")}.`;
  }

  if (!isSectionType(value.type)) {
    return `Tipo de seção desconhecido em #${index + 1}: ${JSON.stringify(value.type)}.`;
  }

  if (value.enabled !== undefined && typeof value.enabled !== "boolean") {
    return `"enabled" da seção "${value.type}" precisa ser true ou false.`;
  }

  if (value.props !== undefined && !isRecord(value.props)) {
    return `"props" da seção "${value.type}" precisa ser um objeto.`;
  }

  return null;
}

function validateThemeShape(value: unknown): string | null {
  if (value === undefined) return null;
  if (!isRecord(value)) return '"theme" precisa ser um objeto.';

  if (value.colors !== undefined) {
    if (!isRecord(value.colors)) return '"theme.colors" precisa ser um objeto.';

    for (const [key, color] of Object.entries(value.colors)) {
      if (typeof color !== "string" || !isHexColor(color)) {
        return `"theme.colors.${key}" precisa ser uma cor hexadecimal, como #6c4bf4.`;
      }
    }
  }

  if (value.radii !== undefined && !isRecord(value.radii)) {
    return '"theme.radii" precisa ser um objeto com base, button e input.';
  }

  return null;
}

/**
 * Validação estrita da importação: recusa **antes** de qualquer alteração de
 * estado, para que um JSON inválido nunca destrua a configuração atual.
 */
export function parseSchemaJson(source: string): SchemaParseResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(source);
  } catch {
    return { error: "JSON malformado. Revise a sintaxe antes de importar." };
  }

  if (!isRecord(parsed)) {
    return { error: "O JSON precisa ser um objeto com template, theme e sections." };
  }

  const unknownKeys = Object.keys(parsed).filter((key) => !SCHEMA_KEYS.includes(key));
  if (unknownKeys.length > 0) {
    return { error: `Propriedade não suportada na raiz: ${unknownKeys.join(", ")}.` };
  }

  if (
    parsed.template !== undefined &&
    !TEMPLATE_IDS.includes(parsed.template as CheckoutTemplateId)
  ) {
    return { error: `"template" aceita apenas: ${TEMPLATE_IDS.join(", ")}.` };
  }

  const themeError = validateThemeShape(parsed.theme);
  if (themeError) return { error: themeError };

  if (!Array.isArray(parsed.sections)) {
    return { error: '"sections" precisa ser uma lista de seções.' };
  }

  for (const [index, section] of parsed.sections.entries()) {
    const error = validateSectionShape(section, index);
    if (error) return { error };
  }

  const schema = normalizeSchema(parsed);

  const [firstError] = validateSchemaForPublish(schema);
  if (firstError) return { error: firstError };

  return { schema };
}

/* — Publicação (RF-CHK-09) — */

/** Regras mínimas para uma configuração conseguir virar página pública. */
export function validateSchemaForPublish(schema: CheckoutSchema): string[] {
  const errors: string[] = [];
  const enabled = schema.sections.filter((section) => section.enabled);

  const form = enabled.find((section) => section.type === "checkout-form");
  const cta = enabled.find((section) => section.type === "payment-cta");

  if (!form) {
    errors.push("A seção Formulário precisa estar ativa: é onde o comprador se identifica.");
  }

  if (!cta) {
    errors.push("A seção Botão de pagamento precisa estar ativa para gerar o PIX.");
  }

  if (cta?.type === "payment-cta" && cta.props.label.trim().length === 0) {
    errors.push("O botão de pagamento está sem texto.");
  }

  return errors;
}

export function isSameSchema(a: CheckoutSchema, b: CheckoutSchema) {
  return JSON.stringify(a) === JSON.stringify(b);
}
