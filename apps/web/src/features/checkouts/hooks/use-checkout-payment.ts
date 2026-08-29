import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { createPixOrder } from "@/features/checkouts/api/public-checkout.api";
import { publicCheckoutQueries } from "@/features/checkouts/api/public-checkout.queries";
import type {
  BuyerFieldErrors,
  BuyerFormValues,
  CheckoutFormController,
} from "@/features/checkouts/types/checkout-buyer";
import { getApiErrorMessage } from "@/shared/api/get-error-message";
import { isValidCpf } from "@/shared/lib/document";
import { onlyDigits } from "@/shared/lib/masks";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

/**
 * Formulário do comprador e geração do PIX. Devolve o controller que o renderer
 * consome, mantendo o renderizador ignorante quanto a como o pedido nasce.
 */
export function useCheckoutPayment(publicSlug: string) {
  const [values, setValues] = useState<BuyerFormValues>({ name: "", email: "", document: "" });
  const [errors, setErrors] = useState<BuyerFieldErrors>({});
  const [orderId, setOrderId] = useState<string | null>(null);

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: () =>
      createPixOrder(publicSlug, {
        buyerName: values.name.trim(),
        buyerEmail: values.email.trim(),
        buyerDocument: onlyDigits(values.document),
      }),
    onSuccess: (order) => setOrderId(order.orderId),
  });

  const { data: order } = useQuery({
    ...publicCheckoutQueries.order(orderId ?? ""),
    enabled: orderId !== null,
  });

  const form: CheckoutFormController = {
    values,
    errors,
    isSubmitting: isPending,
    submitErrorMessage: isError
      ? getApiErrorMessage(error, "Não foi possível gerar o PIX. Tente novamente.")
      : null,
    setField: (field, value) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    },
    onSubmit: () => {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;

      void mutateAsync().catch(() => undefined);
    },
  };

  return { form, order: order ?? null, buyerName: values.name.trim() };
}
