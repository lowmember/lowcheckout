import { useState } from "react";

import { cn } from "../internal/cn";
import { ArrowDownIcon, ArrowUpIcon, GripIcon, TrashIcon } from "../internal/icons";
import { getSectionDefinition } from "../lib/section-registry";
import type { CheckoutFormController } from "../types/checkout-buyer";
import type { CheckoutContent } from "../types/checkout-content";
import type { CheckoutSchema, CheckoutSection } from "../types/checkout-schema";
import { CheckoutThemeShell } from "./checkout-theme-shell";
import {
  type CheckoutRendererSelection,
  type CheckoutViewport,
  ItemDragProvider,
  RendererProvider,
} from "./renderer-context";
import { SectionRenderer } from "./section-renderer";
import { SelectionToolbar } from "./selection-toolbar";

export type { CheckoutRendererSelection };

interface CheckoutRendererProps {
  schema: CheckoutSchema;
  content: CheckoutContent;
  /** Só decide qual banner usar: o layout responde por container query. */
  viewport?: CheckoutViewport;
  form?: CheckoutFormController;
  selection?: CheckoutRendererSelection;
  className?: string;
}

/**
 * O renderizador do checkout — usado pelo preview do editor **e** pela página
 * pública. Não existe uma segunda implementação: o que o usuário vê no editor
 * é literalmente o mesmo componente que o comprador recebe.
 *
 * A responsividade é por container query: dentro do frame de 390px do editor
 * ele reflui igual ao celular, sem um layout mobile paralelo.
 */
export function CheckoutRenderer({
  schema,
  content,
  viewport = "desktop",
  form,
  selection,
  className,
}: CheckoutRendererProps) {
  const enabledSections = schema.sections.filter((section) => section.enabled);
  const lastIndex = enabledSections.length - 1;

  // Arrastar seção é um gesto do preview, não do schema — mora aqui, efêmero,
  // e vira uma chamada de reordenação só no drop.
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

  return (
    <RendererProvider content={content} viewport={viewport} form={form} selection={selection}>
      <ItemDragProvider>
        <CheckoutThemeShell theme={schema.theme} className={className}>
          {enabledSections.map((section, index) =>
            selection ? (
              <SelectableSection
                key={section.id}
                section={section}
                isSelected={section.id === selection.selectedSectionId}
                canMoveUp={index > 0}
                canMoveDown={index < lastIndex}
                selection={selection}
                isDragging={draggedSectionId === section.id}
                isDragOver={
                  dragOverSectionId === section.id &&
                  draggedSectionId !== null &&
                  draggedSectionId !== section.id
                }
                onDragStart={() => setDraggedSectionId(section.id)}
                onDragOverSection={() => {
                  // Devolve se aceita o drop: só quando a alça do toolbar
                  // começou o arrasto — um arquivo solto do sistema, por
                  // exemplo, não deve ganhar `preventDefault` daqui.
                  if (draggedSectionId === null) return false;
                  setDragOverSectionId(section.id);
                  return true;
                }}
                onDrop={() => {
                  if (draggedSectionId === null) return false;
                  if (draggedSectionId !== section.id) {
                    selection.onReorderSection(draggedSectionId, section.id);
                  }
                  setDraggedSectionId(null);
                  setDragOverSectionId(null);
                  return true;
                }}
                onDragEnd={() => {
                  setDraggedSectionId(null);
                  setDragOverSectionId(null);
                }}
              />
            ) : (
              <SectionRenderer key={section.id} section={section} />
            ),
          )}
        </CheckoutThemeShell>
      </ItemDragProvider>
    </RendererProvider>
  );
}

interface SelectableSectionProps {
  section: CheckoutSection;
  isSelected: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  selection: CheckoutRendererSelection;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  /** Devolve `true` quando o drop deve ser aceito — só então o handler chama `preventDefault`. */
  onDragOverSection: () => boolean;
  onDrop: () => boolean;
  onDragEnd: () => void;
}

/**
 * Liga o preview à lista de seções: a seção selecionada ganha contorno,
 * etiqueta e um toolbar de mover/arrastar/excluir — e clicar em qualquer
 * ponto dela seleciona. O overlay cobre a seção inteira de propósito — no
 * editor os campos já são inertes.
 */
function SelectableSection({
  section,
  isSelected,
  canMoveUp,
  canMoveDown,
  selection,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOverSection,
  onDrop,
  onDragEnd,
}: SelectableSectionProps) {
  const definition = getSectionDefinition(section.type);
  // A primeira/última seção encosta no canto arredondado da moldura do
  // preview (que é `overflow-hidden`) — sem acompanhar esse raio, o contorno
  // reto era cortado pelo clip em vez de curvar junto.
  const isFirst = !canMoveUp;
  const isLast = !canMoveDown;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: só recebe drop de uma seção já arrastada pela alça do toolbar — não é a origem da interação.
    <div
      data-section-id={section.id}
      className={cn("group/section relative transition-opacity", isDragging && "opacity-40")}
      onDragOver={(event) => {
        if (onDragOverSection()) event.preventDefault();
      }}
      onDrop={(event) => {
        if (onDrop()) event.preventDefault();
      }}
    >
      <SectionRenderer section={section} />

      <button
        type="button"
        aria-pressed={isSelected}
        aria-label={`Selecionar seção ${definition.label}`}
        onClick={() => selection.onSelectSection(section.id)}
        className={cn(
          "absolute inset-0 z-0 cursor-pointer transition-colors duration-200",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500",
          isSelected || isDragOver
            ? "bg-blue-500/[0.04] outline-2 -outline-offset-2 outline-blue-500"
            : "outline-0 hover:bg-blue-500/[0.03] hover:outline-2 hover:-outline-offset-2 hover:outline-blue-400/60",
          isDragOver && "outline-dashed",
          isFirst && "rounded-t-[var(--lc-frame-radius,0px)]",
          isLast && "rounded-b-[var(--lc-frame-radius,0px)]",
        )}
      />

      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-0 left-0 z-20 rounded-br-md px-2 py-0.5 font-medium text-[11px] text-white",
          "transition-opacity duration-200",
          isSelected
            ? "bg-blue-500 opacity-100"
            : "bg-blue-400 opacity-0 group-hover/section:opacity-100",
          isFirst && "rounded-tl-[var(--lc-frame-radius,0px)]",
        )}
      >
        {definition.label}
      </span>

      {isSelected && (
        <SelectionToolbar
          className={cn(
            "top-0 right-0 rounded-none rounded-bl-md",
            isFirst && "rounded-tr-[var(--lc-frame-radius,0px)]",
          )}
          actions={[
            {
              label: "Arrastar para reordenar",
              icon: <GripIcon className="size-3.5" />,
              drag: { onDragStart, onDragEnd },
            },
            {
              label: "Mover seção para cima",
              icon: <ArrowUpIcon className="size-3.5" />,
              isDisabled: !canMoveUp,
              onClick: () => selection.onMoveSection(section.id, "up"),
            },
            {
              label: "Mover seção para baixo",
              icon: <ArrowDownIcon className="size-3.5" />,
              isDisabled: !canMoveDown,
              onClick: () => selection.onMoveSection(section.id, "down"),
            },
            ...(definition.isRequired
              ? []
              : [
                  {
                    label: "Remover seção",
                    icon: <TrashIcon className="size-3.5" />,
                    isDestructive: true,
                    onClick: () => selection.onRemoveSection(section.id),
                  },
                ]),
          ]}
        />
      )}
    </div>
  );
}
