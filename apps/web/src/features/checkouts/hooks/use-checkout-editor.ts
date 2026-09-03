import type {
  CheckoutSchema,
  CheckoutSectionType,
  CustomizationSource,
} from "@lowcheckout/checkout-renderer";
import {
  createLocalId,
  findListField,
  isSameSchema,
  toCustomization,
  validateSchemaForPublish,
} from "@lowcheckout/checkout-renderer";
import { useEffect, useMemo, useState } from "react";

import { useSaveCustomization } from "@/features/checkouts/hooks/use-save-customization";
import {
  addSection,
  addSectionItem,
  duplicateSectionItem,
  findSection,
  findSectionItem,
  findSectionItemIndex,
  getSectionItems,
  moveSection,
  moveSectionByDirection,
  moveSectionItem,
  moveSectionItemByDirection,
  removeSection,
  removeSectionItem,
  reorderSection,
  reorderSectionItem,
  type ThemePatch,
  toggleSection,
  updateSectionItem,
  updateSectionProps,
  updateTheme,
} from "@/features/checkouts/lib/schema-operations";
import type { Checkout } from "@/features/checkouts/types/checkout";

/** Elemento dentro de uma seção: o array em que ele vive mais o id dele. */
export interface EditorItemSelection {
  fieldKey: string;
  itemId: string;
}

interface UseCheckoutEditorOptions {
  checkout: Checkout;
  hasLinkedOffer: boolean;
}

/**
 * Estado do editor visual. Concentra o schema em edição, o que já foi salvo e
 * as regras de publicação; os componentes só disparam ações e leem derivados.
 */
export function useCheckoutEditor({ checkout, hasLinkedOffer }: UseCheckoutEditorOptions) {
  const saved = useMemo(() => toCustomization(checkout.customization), [checkout.customization]);

  const [schema, setSchema] = useState<CheckoutSchema>(saved.draft);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    saved.draft.sections[0]?.id ?? null,
  );
  const [selectedItem, setSelectedItem] = useState<EditorItemSelection | null>(null);
  const [pendingSource, setPendingSource] = useState<CustomizationSource>("builder");

  const {
    saveDraft,
    publishDraft,
    isSavingDraft,
    isPublishing,
    didSaveDraft,
    didPublish,
    saveErrorMessage,
  } = useSaveCustomization(checkout.id);

  // A API é a fonte da verdade: uma escrita bem-sucedida (ou outra aba) reidrata.
  useEffect(() => {
    setSchema(saved.draft);
  }, [saved.draft]);

  const selectedSection = findSection(schema, selectedSectionId);
  const selectedItemValue = findSectionItem(
    schema,
    selectedSectionId,
    selectedItem?.fieldKey ?? null,
    selectedItem?.itemId ?? null,
  );
  // O elemento pode ter sumido (exclusão, importação de JSON): sem valor, a
  // seleção volta a ser da seção e nenhum painel fica apontando para o vazio.
  const activeItem = selectedItemValue ? selectedItem : null;
  const activeItemField =
    activeItem && selectedSection
      ? findListField(selectedSection.type, activeItem.fieldKey)
      : undefined;
  const isDirty = !isSameSchema(schema, saved.draft);
  const publishErrors = validateSchemaForPublish(schema);
  const isPublished = saved.published !== null;
  const hasUnpublishedChanges =
    isDirty || (saved.published !== null && !isSameSchema(schema, saved.published));

  if (!hasLinkedOffer) {
    publishErrors.push("Vincule ao menos uma oferta: sem ela o checkout não tem URL pública.");
  }

  function replaceSchema(next: CheckoutSchema, source: CustomizationSource = "builder") {
    setSchema(next);
    setPendingSource(source);

    if (!next.sections.some((section) => section.id === selectedSectionId)) {
      setSelectedSectionId(next.sections[0]?.id ?? null);
      setSelectedItem(null);
    }
  }

  function selectSection(sectionId: string) {
    setSelectedSectionId(sectionId);
    setSelectedItem(null);
  }

  function selectItem(sectionId: string, fieldKey: string, itemId: string) {
    setSelectedSectionId(sectionId);
    setSelectedItem({ fieldKey, itemId });
  }

  return {
    schema,
    savedCustomization: saved,
    selectedSection,
    selectedSectionId,
    selectSection,

    /** Seleção fina: um elemento dentro da seção (benefício, FAQ, link...). */
    selectItem,
    selectedItem: activeItem,
    selectedItemId: activeItem?.itemId ?? null,
    selectedItemField: activeItemField,
    selectedItemValue,
    selectedItemIndex: findSectionItemIndex(
      schema,
      selectedSectionId,
      activeItem?.fieldKey ?? null,
      activeItem?.itemId ?? null,
    ),
    selectedItemCount:
      selectedSection && activeItem
        ? getSectionItems(selectedSection, activeItem.fieldKey).length
        : 0,

    isDirty,
    isPublished,
    hasUnpublishedChanges,
    publishedAt: saved.publishedAt,
    publishErrors,
    canPublish: publishErrors.length === 0,

    isSavingDraft,
    isPublishing,
    didSaveDraft: didSaveDraft && !isDirty,
    didPublish,
    saveErrorMessage,

    addSection: (type: CheckoutSectionType) => {
      const next = addSection(schema, type);
      setSchema(next);
      setPendingSource("builder");
      setSelectedSectionId(next.sections[next.sections.length - 1].id);
    },
    removeSection: (sectionId: string) => replaceSchema(removeSection(schema, sectionId)),

    addSectionItem: (sectionId: string, fieldKey: string) => {
      const result = addSectionItem(schema, sectionId, fieldKey);
      if (!result.itemId) return;

      replaceSchema(result.schema);
      selectItem(sectionId, fieldKey, result.itemId);
    },
    removeSectionItem: (sectionId: string, fieldKey: string, itemId: string) => {
      replaceSchema(removeSectionItem(schema, sectionId, fieldKey, itemId));

      if (selectedItem?.itemId === itemId) setSelectedItem(null);
    },
    moveSectionItem: (sectionId: string, fieldKey: string, from: number, to: number) =>
      replaceSchema(moveSectionItem(schema, sectionId, fieldKey, from, to)),
    duplicateSectionItem: (sectionId: string, fieldKey: string, itemId: string) => {
      const nextItemId = createLocalId("item");

      replaceSchema(duplicateSectionItem(schema, sectionId, fieldKey, itemId, nextItemId));
      selectItem(sectionId, fieldKey, nextItemId);
    },
    updateSectionItem: (
      sectionId: string,
      fieldKey: string,
      itemId: string,
      patch: Record<string, unknown>,
    ) => replaceSchema(updateSectionItem(schema, sectionId, fieldKey, itemId, patch)),
    toggleSection: (sectionId: string) => replaceSchema(toggleSection(schema, sectionId)),
    moveSection: (from: number, to: number) => replaceSchema(moveSection(schema, from, to)),
    /** Mover pelo toolbar preso ao contorno no preview: só enxerga seções visíveis. */
    moveSectionByDirection: (sectionId: string, direction: "up" | "down") =>
      replaceSchema(moveSectionByDirection(schema, sectionId, direction)),
    moveSectionItemByDirection: (
      sectionId: string,
      fieldKey: string,
      itemId: string,
      direction: "up" | "down",
    ) => replaceSchema(moveSectionItemByDirection(schema, sectionId, fieldKey, itemId, direction)),
    /** Arrastar-e-soltar pela alça do toolbar preso ao contorno no preview. */
    reorderSection: (sectionId: string, targetSectionId: string) =>
      replaceSchema(reorderSection(schema, sectionId, targetSectionId)),
    reorderSectionItem: (
      sectionId: string,
      fieldKey: string,
      itemId: string,
      targetItemId: string,
    ) => replaceSchema(reorderSectionItem(schema, sectionId, fieldKey, itemId, targetItemId)),
    updateSectionProps: (sectionId: string, patch: Record<string, unknown>) =>
      replaceSchema(updateSectionProps(schema, sectionId, patch)),
    updateTheme: (patch: ThemePatch) => replaceSchema(updateTheme(schema, patch)),
    /** Importação de JSON: substitui tudo e marca a origem para a revisão da API. */
    importSchema: (next: CheckoutSchema) => replaceSchema(next, "json_import"),

    save: () => saveDraft(saved, schema, pendingSource),
    publish: () => publishDraft(schema),
  };
}
