import type {
  BuyerFieldErrors,
  BuyerFormValues,
  CheckoutFormController,
} from "@lowcheckout/checkout-renderer";
import { onlyDigits } from "@lowcheckout/checkout-renderer";
import type { OrderStatus } from "@lowcheckout/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { createPublicOrder } from "@/features/checkout/api/public-checkout.api";
import { publicCheckoutQueries } from "@/features/checkout/api/public-checkout.queries";
import {
  forgetPendingOrder,
  persistPendingOrderId,
  readPendingOrderId,
  readVisitorId,
} from "@/features/checkout/lib/browser-storage";
import { trackInitiateCheckout, trackPurchase } from "@/features/checkout/lib/pixels";
import { getApiErrorMessage } from "@/shared/api/get-error-message";
import { isValidCpf } from "@/shared/lib/document";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Estados que não voltam atrás: chegou num deles, o polling não tem mais o que ver. */
const FINAL_STATUSES: readonly OrderStatus[] = ["paid", "expired", "canceled", "refunded"];

const GATEWAY_UNAVAILABLE_MESSAGE =
  "Este checkout está temporariamente sem meio de pagamento. Fale com quem te enviou o link.";

function validate(values: BuyerFormValues): BuyerFieldErrors {
  const errors: BuyerFieldErrors = {};

  if (values.name.trim().split(/\s+/).filter(Boolean).length < 2) {
    errors.name = "Informe seu nome completo.";
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!isValidCpf(values.document)) {
    errors.document = "Informe um CPF válido.";
  }

  return errors;
}

interface UseCheckoutPaymentOptions {
  /** `false` quando a conta não tem gateway conectado: a página não gera PIX. */
  paymentAvailable: boolean;
}

/**
 * Formulário do comprador, geração do PIX e acompanhamento do pedido.
 *
 * Devolve o controller que o renderizador consome — é o que mantém o
 * renderizador ignorante quanto a como o pedido nasce, e o que faz o mesmo
 * componente servir preview (sem controller) e página real (com).
 */
export function useCheckoutPayment(
  publicSlug: string,
  { paymentAvailable }: UseCheckoutPaymentOptions,
) {
  const queryClient = useQueryClient();

  const [values, setValues] = useState<BuyerFormValues>({ name: "", email: "", document: "" });
  const [errors, setErrors] = useState<BuyerFieldErrors>({});

  // Retomada: quem recarregou a tela do PIX (ou voltou do app do banco) cai
  // direto no pedido que já existe, em vez de preencher tudo de novo.
  const [orderId, setOrderId] = useState<string | null>(() => readPendingOrderId(publicSlug));

  const { data: order } = useQuery({
    ...publicCheckoutQueries.order(orderId ?? ""),
    enabled: orderId !== null,
  });

  const { data: liveStatus } = useQuery({
    ...publicCheckoutQueries.orderStatus(orderId ?? ""),
    enabled: orderId !== null && order !== undefined && !FINAL_STATUSES.includes(order.status),
  });

  // O polling só carrega o status; o documento completo (QR Code, `deliveryUrl`)
  // é rebuscado uma vez, no instante em que o status realmente muda.
  useEffect(() => {
    if (orderId === null || liveStatus === undefined || order === undefined) {
      return;
    }

    if (liveStatus.status !== order.status) {
      void queryClient.invalidateQueries({
        queryKey: publicCheckoutQueries.order(orderId).queryKey,
      });
    }
  }, [liveStatus, order, orderId, queryClient]);

  // Pedido resolvido: a lembrança da compra em andamento não serve mais. Sai do
  // storage para que um reload depois de expirar volte ao formulário.
  useEffect(() => {
    if (order && FINAL_STATUSES.includes(order.status)) {
      forgetPendingOrder(publicSlug);
    }
  }, [order, publicSlug]);

  const hasTrackedPurchase = useRef(false);

  useEffect(() => {
    if (order?.status !== "paid" || hasTrackedPurchase.current) {
      return;
    }

    hasTrackedPurchase.current = true;
    trackPurchase({
      orderId: order.id,
      amountInCents: order.amountInCents,
      currency: order.currency,
    });
  }, [order]);

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: () =>
      createPublicOrder(publicSlug, {
        buyerName: values.name.trim(),
        buyerEmail: values.email.trim(),
        buyerDocument: onlyDigits(values.document),
        visitorId: readVisitorId(),
      }),
    onSuccess: (created) => {
      persistPendingOrderId(publicSlug, created.id);
      queryClient.setQueryData(publicCheckoutQueries.order(created.id).queryKey, created);
      setOrderId(created.id);

      trackInitiateCheckout({
        amountInCents: created.amountInCents,
        currency: created.currency,
      });
    },
  });

  const form: CheckoutFormController = {
    values,
    errors,
    isSubmitting: isPending,
    submitErrorMessage: resolveSubmitErrorMessage({ paymentAvailable, isError, error }),
    setField: (field, value) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    },
    onSubmit: () => {
      if (!paymentAvailable) {
        return;
      }

      const validationErrors = validate(values);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      mutate();
    },
  };

  return { form, order: order ?? null };
}

/**
 * Gateway ausente é aviso permanente, não erro de envio: o comprador precisa
 * saber antes de preencher o formulário que ali não sai PIX.
 */
function resolveSubmitErrorMessage({
  paymentAvailable,
  isError,
  error,
}: {
  paymentAvailable: boolean;
  isError: boolean;
  error: unknown;
}): string | null {
  if (!paymentAvailable) {
    return GATEWAY_UNAVAILABLE_MESSAGE;
  }

  return isError
    ? getApiErrorMessage(error, "Não foi possível gerar o PIX. Tente novamente.")
    : null;
}
