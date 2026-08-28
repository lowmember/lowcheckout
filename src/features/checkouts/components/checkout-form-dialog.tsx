import { type FormEvent, useEffect, useState } from "react";

import { useSaveCheckout } from "@/features/checkouts/hooks/use-save-checkout";
import type { Checkout, CheckoutFieldErrors } from "@/features/checkouts/types/checkout";
import { useProducts } from "@/features/products";
import { isAbsoluteUrl } from "@/shared/lib/is-absolute-url";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { SelectField } from "@/shared/ui/select-field";
import { TextField } from "@/shared/ui/text-field";

interface FormValues {
  productId: string;
  internalTitle: string;
  displayName: string;
  bannerDesktopUrl: string;
  bannerMobileUrl: string;
}

const EMPTY_VALUES: FormValues = {
  productId: "",
  internalTitle: "",
  displayName: "",
  bannerDesktopUrl: "",
  bannerMobileUrl: "",
};

function toFormValues(checkout?: Checkout): FormValues {
  if (!checkout) return EMPTY_VALUES;

  return {
    productId: checkout.productId,
    internalTitle: checkout.internalTitle,
    displayName: checkout.displayName,
    bannerDesktopUrl: checkout.bannerDesktopUrl ?? "",
    bannerMobileUrl: checkout.bannerMobileUrl ?? "",
  };
}

interface CheckoutFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  checkout?: Checkout;
}

export function CheckoutFormDialog({ isOpen, onClose, checkout }: CheckoutFormDialogProps) {
  const isEditing = Boolean(checkout);
  const { products, isLoadingProducts } = useProducts();
  const [values, setValues] = useState<FormValues>(() => toFormValues(checkout));
  const [errors, setErrors] = useState<CheckoutFieldErrors>({});

  const { saveCheckout, isSavingCheckout, hasSaveCheckoutError, saveCheckoutErrorMessage } =
    useSaveCheckout({ checkoutId: checkout?.id, onSuccess: onClose });

  useEffect(() => {
    if (!isOpen) return;

    const next = toFormValues(checkout);
    setValues({
      ...next,
      productId: next.productId || (products[0]?.id ?? ""),
    });
    setErrors({});
  }, [isOpen, checkout, products]);

  function setField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors: CheckoutFieldErrors = {};

    if (!isEditing && !values.productId) validationErrors.productId = "Escolha um produto.";
    if (!values.internalTitle.trim()) validationErrors.internalTitle = "Informe o título interno.";
    if (!values.displayName.trim()) validationErrors.displayName = "Informe o nome de exibição.";

    if (values.bannerDesktopUrl.trim() && !isAbsoluteUrl(values.bannerDesktopUrl.trim())) {
      validationErrors.bannerDesktopUrl = "Informe uma URL absoluta (https://...).";
    }

    if (values.bannerMobileUrl.trim() && !isAbsoluteUrl(values.bannerMobileUrl.trim())) {
      validationErrors.bannerMobileUrl = "Informe uma URL absoluta (https://...).";
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    await saveCheckout({
      productId: values.productId,
      internalTitle: values.internalTitle.trim(),
      displayName: values.displayName.trim(),
      bannerDesktopUrl: values.bannerDesktopUrl.trim() || null,
      bannerMobileUrl: values.bannerMobileUrl.trim() || null,
    }).catch(() => undefined);
  }

  const productOptions = products.map((product) => ({
    value: product.id,
    label: product.name,
  }));

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar checkout" : "Novo checkout"}
      description="O título interno aparece só no painel. O nome de exibição vai para a página pública."
    >
      <form id="checkout-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        {isEditing ? null : (
          <SelectField
            label="Produto"
            options={
              productOptions.length > 0
                ? productOptions
                : [{ value: "", label: isLoadingProducts ? "Carregando..." : "Nenhum produto" }]
            }
            value={values.productId}
            error={errors.productId}
            disabled={productOptions.length === 0}
            hint="O produto de um checkout não pode ser trocado depois."
            onChange={(event) => setField("productId", event.target.value)}
          />
        )}

        <TextField
          label="Título interno"
          placeholder="Campanha Black Friday"
          value={values.internalTitle}
          error={errors.internalTitle}
          maxLength={120}
          onChange={(event) => setField("internalTitle", event.target.value)}
        />

        <TextField
          label="Nome de exibição"
          placeholder="Curso de tráfego pago"
          value={values.displayName}
          error={errors.displayName}
          maxLength={120}
          hint="Usado como título da página pública e no rodapé."
          onChange={(event) => setField("displayName", event.target.value)}
        />

        <TextField
          label="URL do banner desktop"
          placeholder="https://..."
          value={values.bannerDesktopUrl}
          error={errors.bannerDesktopUrl}
          inputMode="url"
          onChange={(event) => setField("bannerDesktopUrl", event.target.value)}
        />

        <TextField
          label="URL do banner mobile"
          placeholder="https://..."
          value={values.bannerMobileUrl}
          error={errors.bannerMobileUrl}
          inputMode="url"
          onChange={(event) => setField("bannerMobileUrl", event.target.value)}
        />

        {hasSaveCheckoutError && (
          <p role="alert" className="animate-fade-in text-red-600 text-sm">
            {saveCheckoutErrorMessage}
          </p>
        )}
      </form>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" form="checkout-form" size="sm" isLoading={isSavingCheckout}>
          {isEditing ? "Salvar alterações" : "Criar checkout"}
        </Button>
      </div>
    </Dialog>
  );
}
