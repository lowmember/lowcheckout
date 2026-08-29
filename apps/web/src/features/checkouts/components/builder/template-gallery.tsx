import { TemplateThumbnail } from "@/features/checkouts/components/builder/template-thumbnail";
import { BLANK_TEMPLATE, CHECKOUT_TEMPLATES } from "@/features/checkouts/lib/templates";
import type { CheckoutTemplateId } from "@/features/checkouts/types/checkout-schema";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { LayersIcon, SparklesIcon } from "@/shared/ui/icons";

interface TemplateGalleryProps {
  selectedTemplateId: CheckoutTemplateId | null;
  onSelect: (templateId: CheckoutTemplateId) => void;
}

/** Etapa 1: escolher como começar. Template é o caminho recomendado. */
export function TemplateGallery({ selectedTemplateId, onSelect }: TemplateGalleryProps) {
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-medium text-neutral-900 text-sm">Usar um template</h2>
          <Badge tone="info">
            <SparklesIcon className="size-3" />
            Recomendado
          </Badge>
        </div>
        <p className="-mt-3 mb-4 text-neutral-500 text-sm">
          Comece com uma estrutura pronta e personalize seu checkout em poucos minutos.
        </p>

        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {CHECKOUT_TEMPLATES.map((template) => {
            const isSelected = template.id === selectedTemplateId;

            return (
              <li key={template.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(template.id)}
                  className={cn(
                    "group w-full overflow-hidden rounded-xl border bg-white text-left",
                    "transition-[border-color,box-shadow,scale] duration-200 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
                    isSelected
                      ? "border-neutral-900 shadow-neutral-900/10 shadow-md"
                      : "border-neutral-200 hover:border-neutral-300 hover:shadow-neutral-900/5 hover:shadow-sm",
                  )}
                >
                  <TemplateThumbnail template={template} />

                  <div className="px-4 py-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-neutral-900 text-sm">{template.name}</p>
                      {isSelected && <Badge tone="success">Selecionado</Badge>}
                    </div>
                    <p className="mt-1 text-neutral-500 text-xs leading-relaxed">
                      {template.description}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 font-medium text-neutral-900 text-sm">Começar do zero</h2>

        <button
          type="button"
          aria-pressed={selectedTemplateId === BLANK_TEMPLATE.id}
          onClick={() => onSelect(BLANK_TEMPLATE.id)}
          className={cn(
            "flex w-full items-center gap-4 rounded-xl border border-dashed bg-white px-5 py-4 text-left",
            "transition-[border-color,background-color] duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
            selectedTemplateId === BLANK_TEMPLATE.id
              ? "border-neutral-900 bg-neutral-50"
              : "border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50/70",
          )}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400">
            <LayersIcon className="size-5" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block font-medium text-neutral-900 text-sm">
              {BLANK_TEMPLATE.name}
            </span>
            <span className="mt-0.5 block text-neutral-500 text-xs leading-relaxed">
              {BLANK_TEMPLATE.description}
            </span>
          </span>

          {selectedTemplateId === BLANK_TEMPLATE.id && <Badge tone="success">Selecionado</Badge>}
        </button>
      </section>
    </div>
  );
}
