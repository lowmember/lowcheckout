import type { CheckoutSection } from "@lowcheckout/checkout-renderer";
import { getSectionDefinition, toPropsRecord } from "@lowcheckout/checkout-renderer";
import type { ReactNode } from "react";

import { PropertyControl } from "@/features/checkouts/components/builder/property-control";
import { PropertyListControl } from "@/features/checkouts/components/builder/property-list-control";
import { SECTION_ICONS } from "@/features/checkouts/components/builder/section-icons";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  EyeOffIcon,
  LayersIcon,
  TrashIcon,
} from "@/shared/ui/icons";

interface PropertiesPanelProps {
  section: CheckoutSection | undefined;
  /** Posição da seção na lista completa (habilitadas e desativadas) — decide os limites do mover. */
  index: number;
  total: number;
  onChange: (patch: Record<string, unknown>) => void;
  onMove: (direction: "up" | "down") => void;
  onToggle: () => void;
  onRemove: () => void;
}

export function PropertiesPanel({
  section,
  index,
  total,
  onChange,
  onMove,
  onToggle,
  onRemove,
}: PropertiesPanelProps) {
  if (!section) {
    return (
      <div className="p-4">
        <EmptyState
          icon={<LayersIcon className="size-5" />}
          title="Nenhuma seção selecionada"
          description="Escolha uma seção na lista ou clique direto no preview para editar suas propriedades."
        />
      </div>
    );
  }

  const definition = getSectionDefinition(section.type);
  const props = toPropsRecord(section.props);

  return (
    <div className="p-4">
      {/* Mesmo azul do contorno no preview: o painel diz qual seção está sob edição. */}
      <header className="mb-3 flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
        <span className="mt-0.5 shrink-0 text-blue-600">{SECTION_ICONS[section.type]}</span>
        <div className="min-w-0">
          <h3 className="font-medium text-neutral-900 text-sm">{definition.label}</h3>
          <p className="mt-0.5 text-neutral-600 text-xs leading-relaxed">
            {definition.description}
          </p>
          {!section.enabled && (
            <Badge tone="warning" className="mt-2">
              Desativada — não aparece no checkout
            </Badge>
          )}
        </div>
      </header>

      {/* Mesmas ações do toolbar preso ao contorno no preview: editar uma
          seção não deveria depender de voltar para a lista de camadas. */}
      <div className="mb-5 flex items-center gap-1">
        <ToolbarAction label="Mover para cima" isDisabled={index <= 0} onClick={() => onMove("up")}>
          <ArrowUpIcon className="size-3.5" />
        </ToolbarAction>
        <ToolbarAction
          label="Mover para baixo"
          isDisabled={index === -1 || index >= total - 1}
          onClick={() => onMove("down")}
        >
          <ArrowDownIcon className="size-3.5" />
        </ToolbarAction>
        <ToolbarAction
          label={section.enabled ? "Desativar seção" : "Ativar seção"}
          onClick={onToggle}
        >
          {section.enabled ? <EyeIcon className="size-3.5" /> : <EyeOffIcon className="size-3.5" />}
        </ToolbarAction>

        <span className="flex-1" />

        {!definition.isRequired && (
          <ToolbarAction label="Remover seção" isDestructive onClick={onRemove}>
            <TrashIcon className="size-3.5" />
          </ToolbarAction>
        )}
      </div>

      <div className="space-y-5">
        {definition.fields.map((field) =>
          field.kind === "list" ? (
            <PropertyListControl
              key={field.key}
              field={field}
              value={props[field.key]}
              onChange={(value) => onChange({ [field.key]: value })}
            />
          ) : (
            <PropertyControl
              key={field.key}
              field={field}
              value={props[field.key]}
              onChange={(value) => onChange({ [field.key]: value })}
            />
          ),
        )}
      </div>
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
