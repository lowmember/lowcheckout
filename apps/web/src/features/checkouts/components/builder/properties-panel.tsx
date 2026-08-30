import { PropertyControl } from "@/features/checkouts/components/builder/property-control";
import { PropertyListControl } from "@/features/checkouts/components/builder/property-list-control";
import { SECTION_ICONS } from "@/features/checkouts/components/builder/section-icons";
import { toPropsRecord } from "@/features/checkouts/lib/schema-normalizers";
import { getSectionDefinition } from "@/features/checkouts/lib/section-registry";
import type { CheckoutSection } from "@/features/checkouts/types/checkout-schema";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";
import { LayersIcon } from "@/shared/ui/icons";

interface PropertiesPanelProps {
  section: CheckoutSection | undefined;
  onChange: (patch: Record<string, unknown>) => void;
}

export function PropertiesPanel({ section, onChange }: PropertiesPanelProps) {
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
      <header className="mb-5 flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
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
