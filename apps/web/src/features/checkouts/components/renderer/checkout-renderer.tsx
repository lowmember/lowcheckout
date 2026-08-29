import { CheckoutThemeShell } from "@/features/checkouts/components/renderer/checkout-theme-shell";
import {
  type CheckoutViewport,
  RendererProvider,
} from "@/features/checkouts/components/renderer/renderer-context";
import { SectionRenderer } from "@/features/checkouts/components/renderer/section-renderer";
import type { CheckoutFormController } from "@/features/checkouts/types/checkout-buyer";
import type { CheckoutContent } from "@/features/checkouts/types/checkout-content";
import type { CheckoutSchema } from "@/features/checkouts/types/checkout-schema";

interface CheckoutRendererProps {
  schema: CheckoutSchema;
  content: CheckoutContent;
  /** Só decide qual banner usar: o layout responde por container query. */
  viewport?: CheckoutViewport;
  form?: CheckoutFormController;
  className?: string;
}

/**
 * O renderizador do checkout — usado pelo preview do editor **e** pela página
 * pública. Não existe uma segunda implementação: o que o usuário vê no editor
 * é literalmente o mesmo componente que o comprador recebe.
 *
 * A responsividade é por container query: dentro do frame de 390px do editor
 * ele reflui igual ao celular, sem um layout mobile paralelo.
 */
export function CheckoutRenderer({
  schema,
  content,
  viewport = "desktop",
  form,
  className,
}: CheckoutRendererProps) {
  const enabledSections = schema.sections.filter((section) => section.enabled);

  return (
    <RendererProvider content={content} viewport={viewport} form={form}>
      <CheckoutThemeShell theme={schema.theme} className={className}>
        {enabledSections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </CheckoutThemeShell>
    </RendererProvider>
  );
}
