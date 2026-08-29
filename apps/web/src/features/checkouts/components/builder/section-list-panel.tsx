import { type ReactNode, useState } from "react";

import { SECTION_ICONS } from "@/features/checkouts/components/builder/section-icons";
import { getSectionDefinition } from "@/features/checkouts/lib/section-registry";
import type { CheckoutSchema } from "@/features/checkouts/types/checkout-schema";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  EyeOffIcon,
  GripIcon,
  PlusIcon,
  TrashIcon,
} from "@/shared/ui/icons";

interface SectionListPanelProps {
  schema: CheckoutSchema;
  selectedSectionId: string | null;
  onSelect: (sectionId: string) => void;
  onToggle: (sectionId: string) => void;
  onRemove: (sectionId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onAdd: () => void;
}

/**
 * Reordenação por arrastar **e** por botões: o drag nativo não é operável por
 * teclado, então as setas são o caminho acessível, não um extra.
 */
export function SectionListPanel({
  schema,
  selectedSectionId,
  onSelect,
  onToggle,
  onRemove,
  onMove,
  onAdd,
}: SectionListPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const lastIndex = schema.sections.length - 1;

  function handleDrop(toIndex: number) {
    if (draggedIndex !== null) onMove(draggedIndex, toIndex);
    setDraggedIndex(null);
    setDropIndex(null);
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-2 border-neutral-200 border-b px-4 py-3">
        <h2 className="font-medium text-neutral-900 text-sm">Seções</h2>
        <span className="text-neutral-400 text-xs">{schema.sections.length}</span>
      </header>

      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
        {schema.sections.map((section, index) => {
          const definition = getSectionDefinition(section.type);
          const isSelected = section.id === selectedSectionId;

          return (
            <li
              key={section.id}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDropIndex(null);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDropIndex(index);
              }}
              onDrop={() => handleDrop(index)}
              className={cn(
                "group flex items-center gap-1 rounded-lg border px-1.5 py-1.5",
                "transition-[background-color,border-color] duration-200 ease-out",
                isSelected
                  ? "border-neutral-300 bg-neutral-50"
                  : "border-transparent hover:bg-neutral-50",
                draggedIndex === index && "opacity-40",
                dropIndex === index && draggedIndex !== index && "border-neutral-900 border-dashed",
              )}
            >
              <GripIcon className="size-4 shrink-0 cursor-grab text-neutral-300 active:cursor-grabbing" />

              <button
                type="button"
                onClick={() => onSelect(section.id)}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                <span
                  className={cn(
                    "shrink-0",
                    section.enabled ? "text-neutral-500" : "text-neutral-300",
                  )}
                >
                  {SECTION_ICONS[section.type]}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate font-medium text-sm",
                      section.enabled ? "text-neutral-800" : "text-neutral-400",
                    )}
                  >
                    {definition.label}
                  </span>
                  {!section.enabled && (
                    <span className="block text-[11px] text-neutral-400">Desativada</span>
                  )}
                </span>
              </button>

              <div className="flex shrink-0 items-center opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
                <IconAction
                  label="Mover para cima"
                  isDisabled={index === 0}
                  onClick={() => onMove(index, index - 1)}
                >
                  <ArrowUpIcon className="size-3.5" />
                </IconAction>

                <IconAction
                  label="Mover para baixo"
                  isDisabled={index === lastIndex}
                  onClick={() => onMove(index, index + 1)}
                >
                  <ArrowDownIcon className="size-3.5" />
                </IconAction>

                <IconAction
                  label={section.enabled ? "Desativar seção" : "Ativar seção"}
                  onClick={() => onToggle(section.id)}
                >
                  {section.enabled ? (
                    <EyeIcon className="size-3.5" />
                  ) : (
                    <EyeOffIcon className="size-3.5" />
                  )}
                </IconAction>

                {!definition.isRequired && (
                  <IconAction
                    label="Remover seção"
                    isDestructive
                    onClick={() => onRemove(section.id)}
                  >
                    <TrashIcon className="size-3.5" />
                  </IconAction>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <footer className="border-neutral-200 border-t p-2">
        <Button variant="secondary" size="sm" className="w-full" onClick={onAdd}>
          <PlusIcon className="size-4" />
          Adicionar seção
        </Button>
      </footer>
    </div>
  );
}

interface IconActionProps {
  label: string;
  isDisabled?: boolean;
  isDestructive?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function IconAction({ label, isDisabled, isDestructive, onClick, children }: IconActionProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "rounded-md p-1.5 transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
        "disabled:cursor-not-allowed disabled:opacity-30",
        isDestructive
          ? "text-neutral-400 hover:bg-red-50 hover:text-red-600"
          : "text-neutral-400 hover:bg-neutral-200/70 hover:text-neutral-800",
      )}
    >
      {children}
    </button>
  );
}
