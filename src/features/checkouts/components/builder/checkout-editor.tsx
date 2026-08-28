import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { AddSectionDialog } from "@/features/checkouts/components/builder/add-section-dialog";
import { CheckoutJsonDialog } from "@/features/checkouts/components/builder/checkout-json-dialog";
import { PreviewFrame } from "@/features/checkouts/components/builder/preview-frame";
import { PropertiesPanel } from "@/features/checkouts/components/builder/properties-panel";
import { SectionListPanel } from "@/features/checkouts/components/builder/section-list-panel";
import { ThemePanel } from "@/features/checkouts/components/builder/theme-panel";
import type { CheckoutViewport } from "@/features/checkouts/components/renderer/renderer-context";
import { useCheckoutContent } from "@/features/checkouts/hooks/use-checkout-content";
import { useCheckoutEditor } from "@/features/checkouts/hooks/use-checkout-editor";
import type { Checkout } from "@/features/checkouts/types/checkout";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CheckIcon,
  CodeIcon,
  MonitorIcon,
  PaletteIcon,
  RocketIcon,
  SmartphoneIcon,
  TypographyIcon,
} from "@/shared/ui/icons";
import { SegmentedControl } from "@/shared/ui/segmented-control";

const VIEWPORT_OPTIONS = [
  { value: "desktop" as const, label: "Desktop", icon: <MonitorIcon className="size-3.5" /> },
  { value: "mobile" as const, label: "Mobile", icon: <SmartphoneIcon className="size-3.5" /> },
];

type InspectorTab = "section" | "theme";

const INSPECTOR_OPTIONS = [
  { value: "section" as const, label: "Seção", icon: <TypographyIcon className="size-3.5" /> },
  { value: "theme" as const, label: "Tema", icon: <PaletteIcon className="size-3.5" /> },
];

interface CheckoutEditorProps {
  checkout: Checkout;
}

/**
 * Editor visual: lista de seções, preview e propriedades. Não é canvas livre —
 * o layout é do sistema de componentes; o usuário compõe, não posiciona.
 */
export function CheckoutEditor({ checkout }: CheckoutEditorProps) {
  const { content, hasLinkedOffer } = useCheckoutContent(checkout);
  const editor = useCheckoutEditor({ checkout, hasLinkedOffer });

  const [viewport, setViewport] = useState<CheckoutViewport>("desktop");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("section");
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-neutral-200 border-b px-4 py-2.5">
        <Link
          to="/checkouts/$checkoutId"
          params={{ checkoutId: checkout.id }}
          className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-neutral-500 text-sm transition-colors hover:text-neutral-900"
        >
          <ArrowLeftIcon className="size-4" />
          Voltar
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-neutral-900 text-sm">{checkout.internalTitle}</p>
          <p className="truncate text-neutral-500 text-xs">
            {editor.isDirty
              ? "Alterações não salvas"
              : editor.hasUnpublishedChanges
                ? "Salvo, aguardando publicação"
                : editor.isPublished
                  ? "Publicado"
                  : "Rascunho"}
          </p>
        </div>

        <SegmentedControl
          options={VIEWPORT_OPTIONS}
          value={viewport}
          onChange={setViewport}
          ariaLabel="Dispositivo do preview"
        />

        <Button variant="secondary" size="sm" onClick={() => setIsJsonOpen(true)}>
          <CodeIcon className="size-4" />
          JSON
        </Button>

        <Button
          variant="secondary"
          size="sm"
          isLoading={editor.isSavingDraft}
          disabled={!editor.isDirty}
          onClick={() => void editor.save().catch(() => undefined)}
        >
          {editor.didSaveDraft && !editor.isDirty ? (
            <CheckIcon className="size-4 animate-pop-in text-emerald-600" />
          ) : null}
          Salvar
        </Button>

        <Button
          size="sm"
          isLoading={editor.isPublishing}
          disabled={!editor.canPublish}
          title={editor.canPublish ? undefined : editor.publishErrors[0]}
          onClick={() => void editor.publish().catch(() => undefined)}
        >
          <RocketIcon className="size-4" />
          Publicar
        </Button>
      </header>

      {(editor.saveErrorMessage || (!editor.canPublish && editor.publishErrors.length > 0)) && (
        <div
          role="alert"
          className={cn(
            "flex shrink-0 items-start gap-2 border-b px-4 py-2.5 text-xs leading-relaxed",
            editor.saveErrorMessage
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-amber-200 bg-amber-50 text-amber-800",
          )}
        >
          <AlertTriangleIcon className="mt-px size-4 shrink-0" />
          <span>{editor.saveErrorMessage ?? editor.publishErrors.join(" ")}</span>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[264px_1fr_320px]">
        <aside className="hidden min-h-0 border-neutral-200 border-r xl:block">
          <SectionListPanel
            schema={editor.schema}
            selectedSectionId={editor.selectedSectionId}
            onSelect={(sectionId) => {
              editor.selectSection(sectionId);
              setInspectorTab("section");
            }}
            onToggle={editor.toggleSection}
            onRemove={editor.removeSection}
            onMove={editor.moveSection}
            onAdd={() => setIsAddSectionOpen(true)}
          />
        </aside>

        <main className="min-h-0 overflow-hidden @container">
          <PreviewFrame schema={editor.schema} content={content} viewport={viewport} />
        </main>

        <aside className="hidden min-h-0 overflow-y-auto border-neutral-200 border-l xl:block">
          <div className="sticky top-0 z-10 border-neutral-200 border-b bg-white/90 px-4 py-3 backdrop-blur">
            <SegmentedControl
              className="w-full"
              options={INSPECTOR_OPTIONS}
              value={inspectorTab}
              onChange={setInspectorTab}
              ariaLabel="Painel de propriedades"
            />
          </div>

          {inspectorTab === "section" ? (
            <PropertiesPanel
              section={editor.selectedSection}
              onChange={(patch) => {
                if (!editor.selectedSectionId) return;
                editor.updateSectionProps(editor.selectedSectionId, patch);
              }}
            />
          ) : (
            <ThemePanel theme={editor.schema.theme} onChange={editor.updateTheme} />
          )}
        </aside>
      </div>

      <p className="shrink-0 border-neutral-200 border-t px-4 py-3 text-center text-neutral-500 text-xs xl:hidden">
        O editor visual precisa de uma tela maior. Abra em um monitor para reordenar seções e editar
        propriedades.
      </p>

      <CheckoutJsonDialog
        isOpen={isJsonOpen}
        onClose={() => setIsJsonOpen(false)}
        schema={editor.schema}
        onImport={editor.importSchema}
      />

      <AddSectionDialog
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        schema={editor.schema}
        onAdd={editor.addSection}
      />
    </div>
  );
}
