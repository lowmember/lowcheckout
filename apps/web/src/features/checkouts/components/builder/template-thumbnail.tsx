import { useMemo } from "react";

import { CheckoutRenderer } from "@/features/checkouts/components/renderer/checkout-renderer";
import type { CheckoutTemplate } from "@/features/checkouts/lib/templates";
import { SAMPLE_CONTENT } from "@/features/checkouts/types/checkout-content";

interface TemplateThumbnailProps {
  template: CheckoutTemplate;
}

/**
 * Miniatura renderizada pelo próprio renderer, em escala reduzida. Nenhuma
 * imagem estática: o que o usuário vê no catálogo é o template de verdade.
 */
export function TemplateThumbnail({ template }: TemplateThumbnailProps) {
  const schema = useMemo(() => template.createSchema(), [template]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative h-44 overflow-hidden border-neutral-200 border-b bg-neutral-50"
    >
      <div className="absolute top-0 left-0 w-[900px] origin-top-left scale-[0.34]">
        <CheckoutRenderer schema={schema} content={SAMPLE_CONTENT} />
      </div>
    </div>
  );
}
