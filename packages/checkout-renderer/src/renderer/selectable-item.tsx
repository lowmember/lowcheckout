import type { DragEventHandler, ReactNode } from "react";

import { cn } from "../internal/cn";
import { ArrowDownIcon, ArrowUpIcon, GripIcon, TrashIcon } from "../internal/icons";
import { useItemDrag, useRendererContext, useSectionId } from "./renderer-context";
import { SelectionToolbar } from "./selection-toolbar";

interface SelectableItemState {
  /** Vai no elemento-raiz do item; `undefined` na página pública. */
  className: string | undefined;
  /** Overlay de clique e contorno; `null` na página pública. */
  overlay: ReactNode;
  /** Toolbar de mover/arrastar/excluir, preso ao contorno; só existe quando o item está selecionado. */
  toolbar: ReactNode;
  /** `onDragOver`/`onDrop` do elemento-raiz — é ele quem aceita o item solto em cima. */
  dragProps: { onDragOver?: DragEventHandler; onDrop?: DragEventHandler };
}

const NOT_SELECTABLE: SelectableItemState = {
  className: undefined,
  overlay: null,
  toolbar: null,
  dragProps: {},
};

interface UseSelectableItemOptions {
  /** Posição do item na lista — decide se "mover para cima/baixo" fica disponível. */
  index: number;
  total: number;
  /**
   * Sobrescreve onde o toolbar gruda no item. Por padrão fica no canto
   * superior direito, junto do contorno — layouts mais apertados (como o
   * acordeão do FAQ) passam a própria posição para não cobrir outro controle.
   */
  toolbarClassName?: string;
}

/**
 * Torna um elemento interno da seção (benefício, depoimento, pergunta, link)
 * selecionável — e arrastável — no preview do editor.
 *
 * O overlay fica **acima** do overlay da seção (`z-10`): clicar no elemento
 * seleciona o elemento, clicar em qualquer outro ponto seleciona a seção.
 * Na página pública o hook devolve nada e o DOM fica idêntico ao de antes.
 */
export function useSelectableItem(
  fieldKey: string,
  itemId: string,
  label: string,
  { index, total, toolbarClassName }: UseSelectableItemOptions,
): SelectableItemState {
  const { selection } = useRendererContext();
  const sectionId = useSectionId();
  const itemDrag = useItemDrag();

  if (!selection || !sectionId) return NOT_SELECTABLE;

  const isSelected = selection.selectedItemId === itemId;
  const isDraggingSelf =
    itemDrag.dragged?.sectionId === sectionId &&
    itemDrag.dragged?.fieldKey === fieldKey &&
    itemDrag.dragged?.itemId === itemId;
  const isDragOver =
    itemDrag.dragged !== null && !isDraggingSelf && itemDrag.dragOverItemId === itemId;

  return {
    className: cn(
      "relative z-10 transition-opacity",
      isSelected && "bg-blue-500/[0.06]",
      isDraggingSelf && "opacity-40",
      isDragOver && "outline-2 outline-dashed -outline-offset-2 outline-blue-500",
    ),
    dragProps: {
      onDragOver: (event) => {
        if (itemDrag.dragged === null) return;
        event.preventDefault();
        itemDrag.setDragOverItemId(itemId);
      },
      onDrop: (event) => {
        const dragged = itemDrag.dragged;
        if (dragged === null) return;

        event.preventDefault();
        itemDrag.setDragOverItemId(null);
        itemDrag.setDragged(null);

        if (dragged.sectionId !== sectionId || dragged.fieldKey !== fieldKey) return;
        if (dragged.itemId === itemId) return;

        selection.onReorderItem(sectionId, fieldKey, dragged.itemId, itemId);
      },
    },
    overlay: (
      <button
        type="button"
        data-item-id={itemId}
        aria-pressed={isSelected}
        aria-label={`Selecionar elemento ${label.trim() || itemId}`}
        onClick={() => selection.onSelectItem(sectionId, fieldKey, itemId)}
        className={cn(
          "absolute inset-0 z-10 cursor-pointer rounded-[inherit]",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600",
          isSelected
            ? "outline-2 -outline-offset-2 outline-blue-600"
            : "outline-0 hover:outline-2 hover:-outline-offset-2 hover:outline-dashed hover:outline-blue-400",
        )}
      />
    ),
    toolbar: isSelected ? (
      <SelectionToolbar
        className={toolbarClassName ?? "top-1 right-1"}
        actions={[
          {
            label: "Arrastar para reordenar",
            icon: <GripIcon className="size-3.5" />,
            drag: {
              onDragStart: () => itemDrag.setDragged({ sectionId, fieldKey, itemId }),
              onDragEnd: () => {
                itemDrag.setDragged(null);
                itemDrag.setDragOverItemId(null);
              },
            },
          },
          {
            label: "Mover para cima",
            icon: <ArrowUpIcon className="size-3.5" />,
            isDisabled: index === 0,
            onClick: () => selection.onMoveItem(sectionId, fieldKey, itemId, "up"),
          },
          {
            label: "Mover para baixo",
            icon: <ArrowDownIcon className="size-3.5" />,
            isDisabled: index === total - 1,
            onClick: () => selection.onMoveItem(sectionId, fieldKey, itemId, "down"),
          },
          {
            label: "Excluir elemento",
            icon: <TrashIcon className="size-3.5" />,
            isDestructive: true,
            onClick: () => selection.onRemoveItem(sectionId, fieldKey, itemId),
          },
        ]}
      />
    ) : null,
  };
}
