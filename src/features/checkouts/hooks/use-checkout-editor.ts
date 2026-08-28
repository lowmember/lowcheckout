import { useEffect, useMemo, useState } from "react";

import { useSaveCustomization } from "@/features/checkouts/hooks/use-save-customization";
import {
  isSameSchema,
  toCustomization,
  validateSchemaForPublish,
} from "@/features/checkouts/lib/checkout-schema";
import {
  addSection,
  findSection,
  moveSection,
  removeSection,
  type ThemePatch,
  toggleSection,
  updateSectionProps,
  updateTheme,
} from "@/features/checkouts/lib/schema-operations";
import type { Checkout } from "@/features/checkouts/types/checkout";
import type {
  CheckoutSchema,
  CheckoutSectionType,
} from "@/features/checkouts/types/checkout-schema";
import type { CustomizationSource } from "@/features/checkouts/types/customization";

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
    }
  }

  return {
    schema,
    savedCustomization: saved,
    selectedSection,
    selectedSectionId,
    selectSection: setSelectedSectionId,

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
    toggleSection: (sectionId: string) => replaceSchema(toggleSection(schema, sectionId)),
    moveSection: (from: number, to: number) => replaceSchema(moveSection(schema, from, to)),
    updateSectionProps: (sectionId: string, patch: Record<string, unknown>) =>
      replaceSchema(updateSectionProps(schema, sectionId, patch)),
    updateTheme: (patch: ThemePatch) => replaceSchema(updateTheme(schema, patch)),
    /** Importação de JSON: substitui tudo e marca a origem para a revisão da API. */
    importSchema: (next: CheckoutSchema) => replaceSchema(next, "json_import"),

    save: () => saveDraft(saved, schema, pendingSource),
    publish: () => publishDraft(schema),
  };
}
