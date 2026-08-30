import { type FormEvent, useEffect, useState } from "react";

import { useSaveOffer } from "@/features/offers/hooks/use-save-offer";
import type { Offer, OfferFieldErrors } from "@/features/offers/types/offer";
import { ImageField } from "@/features/uploads";
import { formatCurrency, maskCurrency, parseCurrencyToCents } from "@/shared/lib/format-currency";
import { isAbsoluteUrl } from "@/shared/lib/is-absolute-url";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { TextField } from "@/shared/ui/text-field";

interface FormValues {
  name: string;
  price: string;
  imageUrl: string;
  deliveryUrl: string;
}

const EMPTY_VALUES: FormValues = { name: "", price: "", imageUrl: "", deliveryUrl: "" };

function toFormValues(offer?: Offer): FormValues {
  if (!offer) return EMPTY_VALUES;

  return {
    name: offer.name,
    price: maskCurrency(String(offer.priceInCents)),
    imageUrl: offer.imageUrl ?? "",
    deliveryUrl: offer.deliveryUrl ?? "",
  };
}

interface OfferFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  /** Fallback do entregável (RF-OFER-02): sem ele, a URL da oferta vira obrigatória. */
  productDefaultDeliveryUrl: string | null;
  offer?: Offer;
}

export function OfferFormDialog({
  isOpen,
  onClose,
  productId,
  productDefaultDeliveryUrl,
  offer,
}: OfferFormDialogProps) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(offer));
  const [errors, setErrors] = useState<OfferFieldErrors>({});

  const { saveOffer, isSavingOffer, hasSaveOfferError, saveOfferErrorMessage } = useSaveOffer({
    productId,
    offerId: offer?.id,
    onSuccess: onClose,
  });

  useEffect(() => {
    if (isOpen) {
      setValues(toFormValues(offer));
      setErrors({});
    }
  }, [isOpen, offer]);

  function setField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const priceInCents = parseCurrencyToCents(values.price);
    const imageUrl = values.imageUrl.trim();
    const deliveryUrl = values.deliveryUrl.trim();
    const validationErrors: OfferFieldErrors = {};

    if (!values.name.trim()) validationErrors.name = "Informe o nome interno da oferta.";
    if (priceInCents <= 0) validationErrors.price = "O valor precisa ser maior que zero.";

    if (imageUrl && !isAbsoluteUrl(imageUrl)) {
      validationErrors.imageUrl = "Informe uma URL absoluta (https://...).";
    }

    if (deliveryUrl && !isAbsoluteUrl(deliveryUrl)) {
      validationErrors.deliveryUrl = "Informe uma URL absoluta (https://...).";
    }

    if (!deliveryUrl && !productDefaultDeliveryUrl) {
      validationErrors.deliveryUrl =
        "O produto não tem entregável padrão, então esta oferta precisa do seu.";
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    await saveOffer({
      name: values.name.trim(),
      priceInCents,
      currency: offer?.currency ?? "BRL",
      imageUrl: imageUrl || null,
      deliveryUrl: deliveryUrl || null,
    }).catch(() => undefined);
  }

  const previewPrice = parseCurrencyToCents(values.price);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={offer ? "Editar oferta" : "Nova oferta"}
      description="O nome é interno: o comprador nunca o vê."
    >
      <form id="offer-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          label="Nome interno"
          placeholder="Lote 1 — early bird"
          value={values.name}
          error={errors.name}
          maxLength={120}
          onChange={(event) => setField("name", event.target.value)}
        />

        <TextField
          label="Valor"
          placeholder="0,00"
          value={values.price}
          error={errors.price}
          inputMode="numeric"
          hint={previewPrice > 0 ? `Cobrança de ${formatCurrency(previewPrice)}.` : undefined}
          onChange={(event) => setField("price", maskCurrency(event.target.value))}
        />

        <ImageField
          label="Imagem da oferta"
          value={values.imageUrl}
          error={errors.imageUrl}
          hint="Opcional. Sem ela, o checkout usa a imagem do produto."
          onChange={(imageUrl) => setField("imageUrl", imageUrl)}
        />

        <TextField
          label="URL do entregável"
          placeholder={productDefaultDeliveryUrl ?? "https://..."}
          value={values.deliveryUrl}
          error={errors.deliveryUrl}
          inputMode="url"
          hint={
            productDefaultDeliveryUrl
              ? "Deixe em branco para herdar o entregável padrão do produto."
              : "O produto não tem entregável padrão — esta URL é obrigatória."
          }
          onChange={(event) => setField("deliveryUrl", event.target.value)}
        />

        {hasSaveOfferError && (
          <p role="alert" className="animate-fade-in text-red-600 text-sm">
            {saveOfferErrorMessage}
          </p>
        )}
      </form>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" form="offer-form" size="sm" isLoading={isSavingOffer}>
          {offer ? "Salvar alterações" : "Criar oferta"}
        </Button>
      </div>
    </Dialog>
  );
}
