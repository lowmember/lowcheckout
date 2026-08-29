import { Link } from "@tanstack/react-router";

import { CheckoutRenderer } from "@/features/checkouts/components/renderer/checkout-renderer";
import { useCheckoutContent } from "@/features/checkouts/hooks/use-checkout-content";
import { isSameSchema, toCustomization } from "@/features/checkouts/lib/checkout-schema";
import { getCheckoutTemplate } from "@/features/checkouts/lib/templates";
import type { Checkout } from "@/features/checkouts/types/checkout";
import { cn } from "@/shared/lib/cn";
import { formatDate } from "@/shared/lib/format-date";
import { Badge } from "@/shared/ui/badge";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { PencilIcon } from "@/shared/ui/icons";

interface CheckoutDesignCardProps {
  checkout: Checkout;
}

/** Resumo do design com preview real e atalho para o editor de tela cheia. */
export function CheckoutDesignCard({ checkout }: CheckoutDesignCardProps) {
  const { content } = useCheckoutContent(checkout);
  const customization = toCustomization(checkout.customization);
  const { draft, published, publishedAt } = customization;

  const template = getCheckoutTemplate(draft.template);
  const enabledCount = draft.sections.filter((section) => section.enabled).length;
  const hasUnpublishedChanges = published === null || !isSameSchema(draft, published);

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Design do checkout"
        description="O preview abaixo usa o mesmo renderizador da página pública."
        action={
          <Link
            to="/checkouts/$checkoutId/editor"
            params={{ checkoutId: checkout.id }}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-lg bg-neutral-800 px-3 font-medium text-sm text-white",
              "transition-[background-color,scale] duration-200 ease-out active:scale-[0.99]",
              "hover:bg-neutral-900",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
            )}
          >
            <PencilIcon className="size-4" />
            Abrir editor visual
          </Link>
        }
      />

      <CardBody className="space-y-4">
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <dt className="text-neutral-500 text-xs">Template</dt>
            <dd className="font-medium text-neutral-900 text-xs">{template?.name ?? "—"}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-neutral-500 text-xs">Seções ativas</dt>
            <dd className="font-medium text-neutral-900 text-xs">
              {enabledCount} de {draft.sections.length}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-neutral-500 text-xs">Publicação</dt>
            <dd>
              {published === null ? (
                <Badge tone="warning">Nunca publicado</Badge>
              ) : hasUnpublishedChanges ? (
                <Badge tone="info">Alterações não publicadas</Badge>
              ) : (
                <Badge tone="success">
                  Publicado{publishedAt ? ` em ${formatDate(publishedAt)}` : ""}
                </Badge>
              )}
            </dd>
          </div>
        </dl>

        <div
          aria-hidden="true"
          className="pointer-events-none relative h-72 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
        >
          <div className="absolute top-0 left-0 w-[1080px] origin-top-left scale-[0.55]">
            <CheckoutRenderer schema={draft} content={content} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
