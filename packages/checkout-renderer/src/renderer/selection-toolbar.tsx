import type { ReactNode } from "react";

import { cn } from "../internal/cn";

/**
 * Ações rápidas presas ao contorno azul de seleção. Existe para que mover,
 * arrastar e remover uma seção ou um elemento não dependa de ir até o painel
 * esquerdo — a ação mora onde o olho já está, em cima do próprio item
 * selecionado.
 */

interface DragHandle {
  onDragStart: () => void;
  onDragEnd: () => void;
}

export interface SelectionAction {
  label: string;
  icon: ReactNode;
  isDisabled?: boolean;
  isDestructive?: boolean;
  /** Ação de clique comum. Omitido quando a ação é uma alça de arrastar. */
  onClick?: () => void;
  /** Alça de arrastar: em vez de clicar, o usuário arrasta a partir daqui. */
  drag?: DragHandle;
}

interface SelectionToolbarProps {
  actions: SelectionAction[];
  className?: string;
}

export function SelectionToolbar({ actions, className }: SelectionToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Ações do item selecionado"
      className={cn(
        // Sem sombra de propósito: o toolbar da seção fica encostado no canto
        // do frame (que é `overflow-hidden` e arredondado no mobile) — uma
        // sombra ali vazava cortada, virando uma mancha na borda azul.
        "pointer-events-auto absolute z-30 flex items-center gap-0.5 rounded-md bg-blue-500 p-0.5",
        className,
      )}
    >
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          title={action.label}
          aria-label={action.label}
          disabled={action.isDisabled}
          draggable={Boolean(action.drag)}
          onDragStart={
            action.drag
              ? (event) => {
                  event.stopPropagation();
                  action.drag?.onDragStart();
                }
              : undefined
          }
          onDragEnd={
            action.drag
              ? (event) => {
                  event.stopPropagation();
                  action.drag?.onDragEnd();
                }
              : undefined
          }
          onClick={
            action.onClick
              ? (event) => {
                  // preventDefault barra o toggle nativo do `<summary>` do FAQ, e
                  // stopPropagation impede que o clique "vaze" para o acordeão ou
                  // qualquer outro ancestral clicável por baixo do toolbar.
                  event.preventDefault();
                  event.stopPropagation();
                  action.onClick?.();
                }
              : undefined
          }
          className={cn(
            "inline-flex size-6 items-center justify-center rounded text-white transition-colors duration-150",
            "focus-visible:outline-2 focus-visible:outline-white",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
            action.drag && "cursor-grab active:cursor-grabbing",
            action.isDestructive ? "hover:bg-red-500" : "hover:bg-white/25",
          )}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
}
