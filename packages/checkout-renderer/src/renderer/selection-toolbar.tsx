import type { ReactNode } from "react";

import { cn } from "../internal/cn";

/**
 * Ações rápidas presas ao contorno azul de seleção. Existe para que mover e
 * remover uma seção ou um elemento não dependa de ir até o painel esquerdo —
 * a ação mora onde o olho já está, em cima do próprio item selecionado.
 */

export interface SelectionAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
  isDestructive?: boolean;
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
        "pointer-events-auto absolute z-30 flex items-center gap-0.5 rounded-md bg-blue-500 p-0.5 shadow-md shadow-blue-900/20",
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
          onClick={(event) => {
            // preventDefault barra o toggle nativo do `<summary>` do FAQ, e
            // stopPropagation impede que o clique "vaze" para o acordeão ou
            // qualquer outro ancestral clicável por baixo do toolbar.
            event.preventDefault();
            event.stopPropagation();
            action.onClick();
          }}
          className={cn(
            "inline-flex size-6 items-center justify-center rounded text-white transition-colors duration-150",
            "focus-visible:outline-2 focus-visible:outline-white",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
            action.isDestructive ? "hover:bg-red-500" : "hover:bg-white/25",
          )}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
}
