import type {
  CheckoutSchema,
  CheckoutSection,
  CheckoutSectionType,
  CheckoutTheme,
} from "@lowcheckout/checkout-renderer";
import {
  createSection,
  findListField,
  getSectionDefinition,
  isRecord,
  toPropsRecord,
} from "@lowcheckout/checkout-renderer";

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

/* — Elementos dentro de uma seção —
 *
 * Benefícios, depoimentos, perguntas e links são arrays dentro dos props. Para
 * o editor eles são "elementos" de primeira classe: dá para selecionar,
 * reordenar e excluir sem abrir o painel da seção. As operações continuam
 * puras e passam por `updateSectionProps`, então o preview, o JSON e a
 * validação de publicação enxergam a mesma mudança.
 */

export function getSectionItems(
  section: CheckoutSection,
  fieldKey: string,
): Record<string, unknown>[] {
  const value = toPropsRecord(section.props)[fieldKey];

  return Array.isArray(value) ? value.filter(isRecord) : [];
}

export function findSectionItem(
  schema: CheckoutSchema,
  sectionId: string | null,
  fieldKey: string | null,
  itemId: string | null,
) {
  const section = findSection(schema, sectionId);
  if (!section || !fieldKey || !itemId) return undefined;

  return getSectionItems(section, fieldKey).find((item) => item.id === itemId);
}

export function findSectionItemIndex(
  schema: CheckoutSchema,
  sectionId: string | null,
  fieldKey: string | null,
  itemId: string | null,
) {
  const section = findSection(schema, sectionId);
  if (!section || !fieldKey || !itemId) return -1;

  return getSectionItems(section, fieldKey).findIndex((item) => item.id === itemId);
}

function replaceSectionItems(
  schema: CheckoutSchema,
  sectionId: string,
  fieldKey: string,
  build: (items: Record<string, unknown>[]) => Record<string, unknown>[] | null,
): CheckoutSchema {
  const section = findSection(schema, sectionId);
  if (!section) return schema;

  const next = build(getSectionItems(section, fieldKey));
  if (!next) return schema;

  return updateSectionProps(schema, sectionId, { [fieldKey]: next });
}

/** Devolve `null` quando a lista já está cheia — o chamador não precisa saber o limite. */
export function addSectionItem(
  schema: CheckoutSchema,
  sectionId: string,
  fieldKey: string,
): { schema: CheckoutSchema; itemId: string | null } {
  const section = findSection(schema, sectionId);
  const field = section ? findListField(section.type, fieldKey) : undefined;
  if (!section || !field) return { schema, itemId: null };

  const items = getSectionItems(section, fieldKey);
  if (items.length >= field.maxItems) return { schema, itemId: null };

  const item = field.createItem();
  const itemId = typeof item.id === "string" ? item.id : null;

  return {
    schema: updateSectionProps(schema, sectionId, { [fieldKey]: [...items, item] }),
    itemId,
  };
}

export function removeSectionItem(
  schema: CheckoutSchema,
  sectionId: string,
  fieldKey: string,
  itemId: string,
): CheckoutSchema {
  return replaceSectionItems(schema, sectionId, fieldKey, (items) =>
    items.filter((item) => item.id !== itemId),
  );
}

export function moveSectionItem(
  schema: CheckoutSchema,
  sectionId: string,
  fieldKey: string,
  fromIndex: number,
  toIndex: number,
): CheckoutSchema {
  return replaceSectionItems(schema, sectionId, fieldKey, (items) => {
    const lastIndex = items.length - 1;

    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return null;
    if (fromIndex > lastIndex || toIndex > lastIndex) return null;

    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    return next;
  });
}

export function duplicateSectionItem(
  schema: CheckoutSchema,
  sectionId: string,
  fieldKey: string,
  itemId: string,
  nextItemId: string,
): CheckoutSchema {
  const section = findSection(schema, sectionId);
  const field = section ? findListField(section.type, fieldKey) : undefined;
  if (!section || !field) return schema;

  return replaceSectionItems(schema, sectionId, fieldKey, (items) => {
    const index = items.findIndex((item) => item.id === itemId);
    if (index < 0 || items.length >= field.maxItems) return null;

    const next = [...items];
    next.splice(index + 1, 0, { ...items[index], id: nextItemId });

    return next;
  });
}

export function updateSectionItem(
  schema: CheckoutSchema,
  sectionId: string,
  fieldKey: string,
  itemId: string,
  patch: Record<string, unknown>,
): CheckoutSchema {
  return replaceSectionItems(schema, sectionId, fieldKey, (items) =>
    items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
  );
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
