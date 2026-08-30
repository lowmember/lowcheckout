import type { ReactNode } from "react";

import { PropertyControl } from "@/features/checkouts/components/builder/property-control";
import type { ListPropertyField } from "@/features/checkouts/lib/section-registry";
import { getSectionDefinition } from "@/features/checkouts/lib/section-registry";
import type { CheckoutSection } from "@/features/checkouts/types/checkout-schema";
import { cn } from "@/shared/lib/cn";
import { ArrowDownIcon, ArrowLeftIcon, ArrowUpIcon, CopyIcon, TrashIcon } from "@/shared/ui/icons";

interface ItemPropertiesPanelProps {
  section: CheckoutSection;
  field: ListPropertyField;
  item: Record<string, unknown>;
  index: number;
  total: number;
  onChange: (patch: Record<string, unknown>) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onBack: () => void;
}

/**
 * Inspetor de um elemento dentro da seção. É o mesmo descritor do registry que
 * gera o painel da seção — aqui ele é aplicado aos campos do item, com as
 * ações de ordem e exclusão junto do conteúdo que está sendo editado.
 */
export function ItemPropertiesPanel({
  section,
  field,
  item,
  index,
  total,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
  onBack,
}: ItemPropertiesPanelProps) {
  const sectionLabel = getSectionDefinition(section.type).label;
  const title = String(item[field.titleKey] ?? "").trim() || `${field.itemLabel} ${index + 1}`;
  const itemId = String(item.id ?? "");

  return (
    <div className="p-4">
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 mb-3 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-neutral-500 text-xs transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
      >
        <ArrowLeftIcon className="size-3.5" />
        {sectionLabel}
      </button>

      <header className="mb-4 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
        <p className="font-medium text-[11px] text-blue-700 uppercase tracking-wide">
          {field.itemLabel}
        </p>
        <h3 className="mt-0.5 truncate font-medium text-neutral-900 text-sm">{title}</h3>
        <p className="mt-0.5 text-neutral-500 text-xs">
          Elemento {index + 1} de {total} em {field.label.toLowerCase()}
        </p>
      </header>

      <div className="mb-5 flex items-center gap-1">
        <ToolbarAction
          label="Mover para cima"
          isDisabled={index === 0}
          onClick={() => onMove(index, index - 1)}
        >
          <ArrowUpIcon className="size-3.5" />
        </ToolbarAction>
        <ToolbarAction
          label="Mover para baixo"
          isDisabled={index === total - 1}
          onClick={() => onMove(index, index + 1)}
        >
          <ArrowDownIcon className="size-3.5" />
        </ToolbarAction>
        <ToolbarAction label="Duplicar" isDisabled={total >= field.maxItems} onClick={onDuplicate}>
          <CopyIcon className="size-3.5" />
        </ToolbarAction>

        <span className="flex-1" />

        <ToolbarAction label="Excluir elemento" isDestructive onClick={onRemove}>
          <TrashIcon className="size-3.5" />
        </ToolbarAction>
      </div>

      <div className="space-y-5">
        {field.itemFields.map((itemField) => (
          <PropertyControl
            key={itemField.key}
            field={itemField}
            value={item[itemField.key]}
            onChange={(value) => onChange({ [itemField.key]: value })}
          />
        ))}
      </div>

      <dl className="mt-6 space-y-1 border-neutral-200 border-t pt-3 text-[11px] text-neutral-400">
        <div className="flex items-center justify-between gap-2">
          <dt>Seção</dt>
          <dd className="truncate font-mono">{section.type}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt>Lista</dt>
          <dd className="truncate font-mono">{field.key}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt>Id</dt>
          <dd className="truncate font-mono">{itemId}</dd>
        </div>
      </dl>
    </div>
  );
}

interface ToolbarActionProps {
  label: string;
  isDisabled?: boolean;
  isDestructive?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolbarAction({
  label,
  isDisabled,
  isDestructive,
  onClick,
  children,
}: ToolbarActionProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md border transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
        "disabled:cursor-not-allowed disabled:opacity-30",
        isDestructive
          ? "border-neutral-200 text-neutral-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          : "border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900",
      )}
    >
      {children}
    </button>
  );
}
