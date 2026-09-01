import { CheckoutStatusBadge } from "@/features/checkouts/components/checkout-status-badge";
import { usePublishCheckout } from "@/features/checkouts/hooks/use-publish-checkout";
import type { Checkout } from "@/features/checkouts/types/checkout";
import { cn } from "@/shared/lib/cn";
import { SpinnerIcon } from "@/shared/ui/icons";
import { Switch } from "@/shared/ui/switch";

interface CheckoutPublishToggleProps {
  checkout: Checkout;
}

/**
 * Publicado ↔ rascunho direto no cabeçalho do checkout. `paused` e `archived`
 * não cabem num binário: nesses estados o toggle dá lugar ao selo de leitura,
 * e a mudança continua pelo formulário de edição.
 */
export function CheckoutPublishToggle({ checkout }: CheckoutPublishToggleProps) {
  const { changeCheckoutStatus, isChangingCheckoutStatus, changeCheckoutStatusErrorMessage } =
    usePublishCheckout({ checkoutId: checkout.id });

  const isTogglable = checkout.status === "draft" || checkout.status === "active";

  if (!isTogglable) {
    return <CheckoutStatusBadge status={checkout.status} />;
  }

  const isPublished = checkout.status === "active";

  return (
    <div className="flex items-center gap-2">
      {changeCheckoutStatusErrorMessage && (
        <span role="alert" className="animate-fade-in text-red-600 text-xs">
          {changeCheckoutStatusErrorMessage}
        </span>
      )}

      <span
        className={cn("font-medium text-xs", isPublished ? "text-emerald-700" : "text-neutral-500")}
      >
        {isPublished ? "Publicado" : "Rascunho"}
      </span>

      {isChangingCheckoutStatus ? (
        <SpinnerIcon className="size-4 text-neutral-400" />
      ) : (
        <Switch
          isChecked={isPublished}
          ariaLabel={isPublished ? "Despublicar checkout" : "Publicar checkout"}
          onChange={(next) =>
            void changeCheckoutStatus(next ? "active" : "draft").catch(() => undefined)
          }
        />
      )}
    </div>
  );
}
