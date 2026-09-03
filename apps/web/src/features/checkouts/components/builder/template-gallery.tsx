import type { CheckoutTemplateId } from "@lowcheckout/checkout-renderer";
import { CHECKOUT_TEMPLATES } from "@lowcheckout/checkout-renderer";

import { TemplateThumbnail } from "@/features/checkouts/components/builder/template-thumbnail";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";

interface TemplateGalleryProps {
  selectedTemplateId: CheckoutTemplateId | null;
  onSelect: (templateId: CheckoutTemplateId) => void;
}

/**
 * Etapa 1: o template do checkout. Existe um só — o layout é decisão de
 * produto —, e a etapa segue aqui para o lojista ver o que vai receber antes
 * de criar. Tudo que ele muda depois é tema e conteúdo, no editor.
 */
export function TemplateGallery({ selectedTemplateId, onSelect }: TemplateGalleryProps) {
  return (
    <section>
      <h2 className="font-medium text-neutral-900 text-sm">O template do checkout</h2>
      <p className="mt-1 mb-4 text-neutral-500 text-sm">
        Uma página só, pensada para conversão. Cores, textos e seções ficam editáveis no editor
        visual.
      </p>

      <ul className="grid gap-4 sm:grid-cols-2">
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
  );
}
