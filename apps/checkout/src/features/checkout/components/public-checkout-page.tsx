import { CheckoutRenderer, PixPaymentScreen, ThankYouScreen } from "@lowcheckout/checkout-renderer";
import { useEffect } from "react";

import {
  AlertTriangleIcon,
  CheckoutNotice,
  ClockIcon,
} from "@/features/checkout/components/checkout-notice";
import { useCheckoutPayment } from "@/features/checkout/hooks/use-checkout-payment";
import { usePublicCheckout } from "@/features/checkout/hooks/use-public-checkout";

interface PublicCheckoutPageProps {
  publicSlug: string;
}

/**
 * A página que o comprador acessa em `lowchk.click/{slug}`.
 *
 * Os três passos do blueprint (§6) são estados de uma tela só, não rotas: a URL
 * do checkout é a que o lojista divulga e não pode mudar debaixo do comprador
 * no meio do pagamento — nem quebrar se ele recarregar. Quem decide o passo é o
 * pedido, e o pedido sobrevive ao reload pelo `sessionStorage`.
 */
export function PublicCheckoutPage({ publicSlug }: PublicCheckoutPageProps) {
  const { publishedSchema, content, paymentAvailable, isLoadingCheckout, hasCheckoutError } =
    usePublicCheckout(publicSlug);

  const { form, order } = useCheckoutPayment(publicSlug, { paymentAvailable });

  // O título só existe depois do fetch: o `index.html` é servido igual para
  // todo slug, e é aqui que a aba ganha o nome da loja.
  useEffect(() => {
    if (content) {
      document.title = content.displayName;
    }
  }, [content]);

  if (isLoadingCheckout) {
    return <CheckoutSkeleton />;
  }

  if (hasCheckoutError || !content) {
    return (
      <CheckoutNotice
        icon={<AlertTriangleIcon />}
        title="Checkout não encontrado"
        description="Este link não existe mais ou foi desativado. Confira o endereço com quem te enviou."
      />
    );
  }

  if (!publishedSchema) {
    return (
      <CheckoutNotice
        icon={<ClockIcon />}
        title="Este checkout ainda não foi publicado"
        description="A página fica disponível assim que o vendedor publicar a configuração."
      />
    );
  }

  if (order?.status === "paid") {
    return <ThankYouScreen theme={publishedSchema.theme} content={content} order={order} />;
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

/**
 * Esqueleto neutro: o tema do checkout ainda não chegou, então qualquer cor
 * aqui seria um chute que piscaria na troca.
 */
function CheckoutSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6">
      <div className="h-44 w-full animate-pulse rounded-md bg-neutral-100" />
      <div className="h-28 w-full animate-pulse rounded-md bg-neutral-100" />
      <div className="h-64 w-full animate-pulse rounded-md bg-neutral-100" />
    </div>
  );
}
