import type { ReactNode } from "react";

import {
  useRendererContext,
  useSectionId,
} from "@/features/checkouts/components/renderer/renderer-context";
import { cn } from "@/shared/lib/cn";

interface SelectableItemState {
  /** Vai no elemento-raiz do item; `undefined` na página pública. */
  className: string | undefined;
  /** Overlay de clique e contorno; `null` na página pública. */
  overlay: ReactNode;
}

const NOT_SELECTABLE: SelectableItemState = { className: undefined, overlay: null };

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
  };
}
