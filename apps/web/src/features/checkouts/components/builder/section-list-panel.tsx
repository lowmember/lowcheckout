import type { CheckoutSchema, CheckoutSection } from "@lowcheckout/checkout-renderer";
import { getListFields, getSectionDefinition } from "@lowcheckout/checkout-renderer";
import { type ReactNode, useState } from "react";

import { SECTION_ICONS } from "@/features/checkouts/components/builder/section-icons";
import { getSectionItems } from "@/features/checkouts/lib/schema-operations";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeOffIcon,
  GripIcon,
  PlusIcon,
  TrashIcon,
} from "@/shared/ui/icons";

interface SectionListPanelProps {
  schema: CheckoutSchema;
  selectedSectionId: string | null;
  selectedItemId: string | null;
  onSelect: (sectionId: string) => void;
  onSelectItem: (sectionId: string, fieldKey: string, itemId: string) => void;
  onToggle: (sectionId: string) => void;
  onRemove: (sectionId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onAdd: () => void;
  onAddItem: (sectionId: string, fieldKey: string) => void;
  onRemoveItem: (sectionId: string, fieldKey: string, itemId: string) => void;
  onMoveItem: (sectionId: string, fieldKey: string, fromIndex: number, toIndex: number) => void;
}

/**
 * Árvore de camadas: seções e, dentro delas, os elementos das listas
 * (benefícios, depoimentos, perguntas, links). Tudo que dá para fazer aqui —
 * selecionar, reordenar, excluir — também é feito clicando no preview.
 *
 * Reordenação de seção por arrastar **e** por botões: o drag nativo não é
 * operável por teclado, então as setas são o caminho acessível, não um extra.
 */
export function SectionListPanel({
  schema,
  selectedSectionId,
  selectedItemId,
  onSelect,
  onSelectItem,
  onToggle,
  onRemove,
  onMove,
  onAdd,
  onAddItem,
  onRemoveItem,
  onMoveItem,
}: SectionListPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Record<string, boolean>>({});

  const lastIndex = schema.sections.length - 1;

  function handleDrop(toIndex: number) {
    if (draggedIndex !== null) onMove(draggedIndex, toIndex);
    setDraggedIndex(null);
    setDropIndex(null);
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="flex items-center justify-between gap-2 border-neutral-200 border-b px-4 py-3">
        <h2 className="font-medium text-neutral-900 text-sm">Camadas</h2>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-medium text-neutral-500 text-xs tabular-nums">
          {schema.sections.length}
        </span>
      </header>

      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
        {schema.sections.map((section, index) => {
          const definition = getSectionDefinition(section.type);
          const listFields = getListFields(section.type);
          const isSelected = section.id === selectedSectionId && !selectedItemId;
          // Aberta por padrão quando é a seção em foco: quem selecionou quer ver dentro.
          const hasSelectedItem = selectedItemId !== null && section.id === selectedSectionId;
          const isExpanded =
            hasSelectedItem ||
            (collapsedSectionIds[section.id] === undefined
              ? section.id === selectedSectionId
              : !collapsedSectionIds[section.id]);

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
              className="space-y-1"
            >
              <div
                className={cn(
                  "group relative flex items-center gap-0.5 overflow-hidden rounded-lg border py-1.5 pr-1.5 pl-1",
                  "transition-[background-color,border-color] duration-200 ease-out",
                  isSelected
                    ? "border-blue-200 bg-blue-50"
                    : "border-transparent bg-white hover:bg-neutral-50",
                  draggedIndex === index && "opacity-40",
                  dropIndex === index &&
                    draggedIndex !== index &&
                    "border-neutral-900 border-dashed",
                )}
              >
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-blue-500"
                  />
                )}

                {listFields.length > 0 ? (
                  <button
                    type="button"
                    aria-label={isExpanded ? "Recolher elementos" : "Expandir elementos"}
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setCollapsedSectionIds((current) => ({
                        ...current,
                        [section.id]: isExpanded,
                      }))
                    }
                    className="shrink-0 rounded p-0.5 text-neutral-400 transition-colors hover:text-neutral-800"
                  >
                    <ChevronDownIcon
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        !isExpanded && "-rotate-90",
                      )}
                    />
                  </button>
                ) : (
                  <span aria-hidden="true" className="size-4 shrink-0" />
                )}

                <GripIcon className="size-4 shrink-0 cursor-grab text-neutral-300 active:cursor-grabbing" />

                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(section.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                >
                  <span
                    className={cn(
                      "shrink-0",
                      !section.enabled
                        ? "text-neutral-300"
                        : isSelected
                          ? "text-blue-600"
                          : "text-neutral-500",
                    )}
                  >
                    {SECTION_ICONS[section.type]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate font-medium text-sm",
                        !section.enabled
                          ? "text-neutral-400"
                          : isSelected
                            ? "text-blue-900"
                            : "text-neutral-800",
                      )}
                    >
                      {definition.label}
                    </span>
                    {!section.enabled && (
                      <span className="block text-[11px] text-neutral-400">Desativada</span>
                    )}
                  </span>
                </button>

                {/* Sobrepõe o rótulo em vez de disputar largura com ele: com 264px
                    de painel, reservar espaço fixo truncava todos os nomes. */}
                <RowActions>
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
                </RowActions>
              </div>

              {isExpanded && listFields.length > 0 && (
                <div className="ml-3.5 space-y-2 border-neutral-200 border-l pl-2">
                  {listFields.map((field) => (
                    <ItemGroup
                      key={field.key}
                      section={section}
                      fieldKey={field.key}
                      groupLabel={listFields.length > 1 ? field.label : undefined}
                      itemLabel={field.itemLabel}
                      titleKey={field.titleKey}
                      addLabel={field.addLabel}
                      maxItems={field.maxItems}
                      selectedItemId={selectedItemId}
                      onSelectItem={onSelectItem}
                      onAddItem={onAddItem}
                      onRemoveItem={onRemoveItem}
                      onMoveItem={onMoveItem}
                    />
                  ))}
                </div>
              )}
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

interface ItemGroupProps {
  section: CheckoutSection;
  fieldKey: string;
  groupLabel?: string;
  itemLabel: string;
  titleKey: string;
  addLabel: string;
  maxItems: number;
  selectedItemId: string | null;
  onSelectItem: (sectionId: string, fieldKey: string, itemId: string) => void;
  onAddItem: (sectionId: string, fieldKey: string) => void;
  onRemoveItem: (sectionId: string, fieldKey: string, itemId: string) => void;
  onMoveItem: (sectionId: string, fieldKey: string, fromIndex: number, toIndex: number) => void;
}

function ItemGroup({
  section,
  fieldKey,
  groupLabel,
  itemLabel,
  titleKey,
  addLabel,
  maxItems,
  selectedItemId,
  onSelectItem,
  onAddItem,
  onRemoveItem,
  onMoveItem,
}: ItemGroupProps) {
  const items = getSectionItems(section, fieldKey);
  const lastIndex = items.length - 1;

  return (
    <div>
      {groupLabel && (
        <p className="px-2 pb-1 font-medium text-[10px] text-neutral-400 uppercase tracking-wide">
          {groupLabel}
        </p>
      )}

      <ul className="space-y-0.5">
        {items.map((item, index) => {
          const itemId = String(item.id ?? "");
          const isSelected = itemId !== "" && itemId === selectedItemId;
          const title = String(item[titleKey] ?? "").trim() || `${itemLabel} ${index + 1}`;

          return (
            <li
              key={itemId || index}
              className={cn(
                "group relative flex items-center gap-1.5 overflow-hidden rounded-md py-1 pr-1 pl-1.5",
                "transition-colors duration-200",
                isSelected ? "bg-blue-50" : "bg-white hover:bg-neutral-50",
              )}
            >
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectItem(section.id, fieldKey, itemId)}
                className="flex min-w-0 flex-1 items-center gap-2 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 shrink-0 rounded-[2px]",
                    isSelected ? "bg-blue-500" : "bg-neutral-300",
                  )}
                />
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-xs",
                    isSelected ? "font-medium text-blue-900" : "text-neutral-600",
                  )}
                >
                  {title}
                </span>
              </button>

              <RowActions>
                <IconAction
                  label="Mover para cima"
                  isDisabled={index === 0}
                  onClick={() => onMoveItem(section.id, fieldKey, index, index - 1)}
                >
                  <ArrowUpIcon className="size-3" />
                </IconAction>

                <IconAction
                  label="Mover para baixo"
                  isDisabled={index === lastIndex}
                  onClick={() => onMoveItem(section.id, fieldKey, index, index + 1)}
                >
                  <ArrowDownIcon className="size-3" />
                </IconAction>

                <IconAction
                  label="Excluir elemento"
                  isDestructive
                  onClick={() => onRemoveItem(section.id, fieldKey, itemId)}
                >
                  <TrashIcon className="size-3" />
                </IconAction>
              </RowActions>
            </li>
          );
        })}
      </ul>

      {items.length < maxItems && (
        <button
          type="button"
          onClick={() => onAddItem(section.id, fieldKey)}
          className="mt-0.5 flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
        >
          <PlusIcon className="size-3" />
          {addLabel}
        </button>
      )}
    </div>
  );
}

/** Ações que aparecem no hover sobre a linha, por cima do rótulo. */
function RowActions({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-y-0.5 right-0.5 flex items-center rounded-md bg-inherit pl-3 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
      {children}
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
