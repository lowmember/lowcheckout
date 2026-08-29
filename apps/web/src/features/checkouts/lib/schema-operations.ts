import { createSection, getSectionDefinition } from "@/features/checkouts/lib/section-registry";
import type {
  CheckoutSchema,
  CheckoutSection,
  CheckoutSectionType,
  CheckoutTheme,
} from "@/features/checkouts/types/checkout-schema";

/**
 * Operações puras sobre o schema. O editor visual não muta nada: cada ação da
 * UI devolve um schema novo. É o que mantém preview, importação por JSON e uma
 * futura geração por IA falando exatamente a mesma linguagem.
 */

export function addSection(schema: CheckoutSchema, type: CheckoutSectionType): CheckoutSchema {
  return { ...schema, sections: [...schema.sections, createSection(type)] };
}

export function removeSection(schema: CheckoutSchema, sectionId: string): CheckoutSchema {
  return { ...schema, sections: schema.sections.filter((section) => section.id !== sectionId) };
}

export function toggleSection(schema: CheckoutSchema, sectionId: string): CheckoutSchema {
  return {
    ...schema,
    sections: schema.sections.map((section) =>
      section.id === sectionId ? { ...section, enabled: !section.enabled } : section,
    ),
  };
}

export function moveSection(
  schema: CheckoutSchema,
  fromIndex: number,
  toIndex: number,
): CheckoutSchema {
  const lastIndex = schema.sections.length - 1;

  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return schema;
  if (fromIndex > lastIndex || toIndex > lastIndex) return schema;

  const sections = [...schema.sections];
  const [moved] = sections.splice(fromIndex, 1);
  sections.splice(toIndex, 0, moved);

  return { ...schema, sections };
}

export function updateSectionProps(
  schema: CheckoutSchema,
  sectionId: string,
  patch: Record<string, unknown>,
): CheckoutSchema {
  return {
    ...schema,
    sections: schema.sections.map((section) =>
      section.id === sectionId
        ? ({ ...section, props: { ...section.props, ...patch } } as CheckoutSection)
        : section,
    ),
  };
}

export interface ThemePatch {
  colors?: Partial<CheckoutTheme["colors"]>;
  typography?: Partial<CheckoutTheme["typography"]>;
  radii?: Partial<CheckoutTheme["radii"]>;
  spacing?: CheckoutTheme["spacing"];
}

export function updateTheme(schema: CheckoutSchema, patch: ThemePatch): CheckoutSchema {
  return {
    ...schema,
    theme: {
      colors: { ...schema.theme.colors, ...patch.colors },
      typography: { ...schema.theme.typography, ...patch.typography },
      radii: { ...schema.theme.radii, ...patch.radii },
      spacing: patch.spacing ?? schema.theme.spacing,
    },
  };
}

/** Seções com `allowMultiple: false` só podem entrar uma vez na página. */
export function canAddSection(schema: CheckoutSchema, type: CheckoutSectionType) {
  if (getSectionDefinition(type).allowMultiple) return true;

  return !schema.sections.some((section) => section.type === type);
}

export function findSection(schema: CheckoutSchema, sectionId: string | null) {
  if (!sectionId) return undefined;

  return schema.sections.find((section) => section.id === sectionId);
}
