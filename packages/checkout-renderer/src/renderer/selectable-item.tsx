import type { ReactNode } from "react";

import { cn } from "../internal/cn";
import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from "../internal/icons";
import { useRendererContext, useSectionId } from "./renderer-context";
import { SelectionToolbar } from "./selection-toolbar";

interface SelectableItemState {
  /** Vai no elemento-raiz do item; `undefined` na página pública. */
  className: string | undefined;
  /** Overlay de clique e contorno; `null` na página pública. */
  overlay: ReactNode;
  /** Toolbar de mover/excluir, preso ao contorno; só existe quando o item está selecionado. */
  toolbar: ReactNode;
}

const NOT_SELECTABLE: SelectableItemState = { className: undefined, overlay: null, toolbar: null };

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
 * selecionável no preview do editor.
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

  if (!selection || !sectionId) return NOT_SELECTABLE;

  const isSelected = selection.selectedItemId === itemId;

  return {
    className: cn("relative z-10", isSelected && "bg-blue-500/[0.06]"),
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
