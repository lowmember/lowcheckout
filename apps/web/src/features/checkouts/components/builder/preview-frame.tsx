import type {
  CheckoutContent,
  CheckoutRendererSelection,
  CheckoutSchema,
  CheckoutViewport,
} from "@lowcheckout/checkout-renderer";
import { CheckoutRenderer } from "@lowcheckout/checkout-renderer";
import { useEffect, useRef } from "react";

import { cn } from "@/shared/lib/cn";

interface PreviewFrameProps {
  schema: CheckoutSchema;
  content: CheckoutContent;
  viewport: CheckoutViewport;
  selection: CheckoutRendererSelection;
}

/**
 * Moldura do preview. Só limita a largura — quem reflui é o próprio renderer,
 * por container query. Nada aqui é uma versão "de mentira" do checkout.
 */
export function PreviewFrame({ schema, content, viewport, selection }: PreviewFrameProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { selectedSectionId, selectedItemId } = selection;

  // O que foi escolhido na árvore de camadas pode estar fora da área visível:
  // sem isto o contorno existe, mas o usuário não vê nada acontecer.
  //
  // A rolagem é feita na mão em vez de `scrollIntoView` porque ele rola todos
  // os ancestrais roláveis — inclusive a página inteira, se ela tiver qualquer
  // sobra de altura. Aqui só o canvas se move.
  useEffect(() => {
    const selector = selectedItemId
      ? `[data-item-id="${CSS.escape(selectedItemId)}"]`
      : selectedSectionId
        ? `[data-section-id="${CSS.escape(selectedSectionId)}"]`
        : null;

    const canvas = canvasRef.current;
    const target = selector ? canvas?.querySelector(selector) : null;
    if (!canvas || !target) return;

    const canvasBox = canvas.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();
    const margin = 24;

    if (targetBox.top >= canvasBox.top && targetBox.bottom <= canvasBox.bottom) return;

    const top =
      targetBox.top < canvasBox.top
        ? targetBox.top - canvasBox.top - margin
        : Math.min(targetBox.bottom - canvasBox.bottom + margin, targetBox.top - canvasBox.top);

    canvas.scrollBy({ top, behavior: "smooth" });
  }, [selectedSectionId, selectedItemId]);

  return (
    <div
      ref={canvasRef}
      className="flex min-h-full justify-center overflow-y-auto bg-neutral-100 p-4 @2xl:p-8"
      style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.06) 1px, transparent 0)",
        backgroundSize: "16px 16px",
      }}
    >
      <div
        className={cn(
          "h-fit w-full overflow-hidden border border-neutral-200 bg-white",
          "transition-[max-width,border-radius] duration-300 ease-out",
          viewport === "mobile"
            ? "max-w-[390px] rounded-3xl shadow-lg shadow-neutral-900/10"
            : "max-w-[1080px] rounded-xl shadow-neutral-900/5 shadow-sm",
        )}
      >
        <CheckoutRenderer
          schema={schema}
          content={content}
          viewport={viewport}
          selection={selection}
        />
      </div>
    </div>
  );
}
