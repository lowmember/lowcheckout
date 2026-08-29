import type { ReactNode } from "react";

import { PixPaymentScreen } from "@/features/checkouts/components/public/pix-payment-screen";
import { ThankYouScreen } from "@/features/checkouts/components/public/thank-you-screen";
import { CheckoutRenderer } from "@/features/checkouts/components/renderer/checkout-renderer";
import { useCheckoutPayment } from "@/features/checkouts/hooks/use-checkout-payment";
import { usePublicCheckout } from "@/features/checkouts/hooks/use-public-checkout";
import { Skeleton } from "@/shared/ui/skeleton";
import { AlertTriangleIcon, ClockIcon } from "@/shared/ui/icons";

interface PublicCheckoutPageProps {
  publicSlug: string;
}

/**
 * Página pública. Consome exatamente o mesmo `CheckoutRenderer` do preview e
 * serve **só** a configuração publicada — rascunho não vaza para o comprador.
 */
export function PublicCheckoutPage({ publicSlug }: PublicCheckoutPageProps) {
  const {
    publishedSchema,
    content,
    isLoadingPublicCheckout,
    hasPublicCheckoutError,
  } = usePublicCheckout(publicSlug);
  const { form, order, buyerName } = useCheckoutPayment(publicSlug);

  if (isLoadingPublicCheckout) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 p-6">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (hasPublicCheckoutError || !content) {
    return (
      <PublicNotice
        icon={<AlertTriangleIcon className="size-6" />}
        title="Checkout não encontrado"
        description="Este link não existe mais ou foi desativado. Confira o endereço com quem te enviou."
      />
    );
  }

  if (!publishedSchema) {
    return (
      <PublicNotice
        icon={<ClockIcon className="size-6" />}
        title="Este checkout ainda não foi publicado"
        description="A página fica disponível assim que o vendedor publicar a configuração."
      />
    );
  }

  if (order?.status === "paid") {
    return (
      <ThankYouScreen theme={publishedSchema.theme} content={content} buyerName={buyerName} />
    );
  }

  if (order) {
    return <PixPaymentScreen theme={publishedSchema.theme} order={order} />;
  }

  return (
    <CheckoutRenderer
      schema={publishedSchema}
      content={content}
      form={form}
      className="min-h-screen"
    />
  );
}

interface PublicNoticeProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function PublicNotice({ icon, title, description }: PublicNoticeProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-400">
          {icon}
        </span>
        <h1 className="font-semibold text-lg text-neutral-900 tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
