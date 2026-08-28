import { CheckoutRenderer } from "@/features/checkouts/components/renderer/checkout-renderer";
import type { CheckoutViewport } from "@/features/checkouts/components/renderer/renderer-context";
import type { CheckoutContent } from "@/features/checkouts/types/checkout-content";
import type { CheckoutSchema } from "@/features/checkouts/types/checkout-schema";
import { cn } from "@/shared/lib/cn";

interface PreviewFrameProps {
  schema: CheckoutSchema;
  content: CheckoutContent;
  viewport: CheckoutViewport;
}

/**
 * Moldura do preview. Só limita a largura — quem reflui é o próprio renderer,
 * por container query. Nada aqui é uma versão "de mentira" do checkout.
 */
export function PreviewFrame({ schema, content, viewport }: PreviewFrameProps) {
  return (
    <div className="flex min-h-full justify-center overflow-y-auto bg-neutral-100 p-4 @2xl:p-8">
      <div
        className={cn(
          "h-fit w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-neutral-900/5 shadow-sm",
          "transition-[max-width] duration-300 ease-out",
          viewport === "mobile" ? "max-w-[390px]" : "max-w-[1080px]",
        )}
      >
        <CheckoutRenderer schema={schema} content={content} viewport={viewport} />
      </div>
    </div>
  );
}
