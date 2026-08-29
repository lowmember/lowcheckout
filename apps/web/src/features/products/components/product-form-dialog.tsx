import { type FormEvent, useEffect, useState } from "react";

import { useSaveProduct } from "@/features/products/hooks/use-save-product";
import type { Product, ProductFieldErrors } from "@/features/products/types/product";
import { isAbsoluteUrl } from "@/shared/lib/is-absolute-url";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { TextField } from "@/shared/ui/text-field";
import { TextareaField } from "@/shared/ui/textarea-field";

interface FormValues {
  name: string;
  description: string;
  imageUrl: string;
  defaultDeliveryUrl: string;
}

const EMPTY_VALUES: FormValues = {
  name: "",
  description: "",
  imageUrl: "",
  defaultDeliveryUrl: "",
};

function toFormValues(product?: Product): FormValues {
  if (!product) return EMPTY_VALUES;

  return {
    name: product.name,
    description: product.description ?? "",
    imageUrl: product.imageUrl ?? "",
    defaultDeliveryUrl: product.defaultDeliveryUrl ?? "",
  };
}

function validate(values: FormValues): ProductFieldErrors {
  const errors: ProductFieldErrors = {};

  if (!values.name.trim()) errors.name = "Informe o nome do produto.";

  if (values.imageUrl.trim() && !isAbsoluteUrl(values.imageUrl.trim())) {
    errors.imageUrl = "Informe uma URL absoluta (https://...).";
  }

  if (values.defaultDeliveryUrl.trim() && !isAbsoluteUrl(values.defaultDeliveryUrl.trim())) {
    errors.defaultDeliveryUrl = "Informe uma URL absoluta (https://...).";
  }

  return errors;
}

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}

export function ProductFormDialog({ isOpen, onClose, product }: ProductFormDialogProps) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(product));
  const [errors, setErrors] = useState<ProductFieldErrors>({});

  const { saveProduct, isSavingProduct, hasSaveProductError, saveProductErrorMessage } =
    useSaveProduct({ productId: product?.id, onSuccess: onClose });

  useEffect(() => {
    if (isOpen) {
      setValues(toFormValues(product));
      setErrors({});
    }
  }, [isOpen, product]);

  function setField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    await saveProduct({
      name: values.name.trim(),
      description: values.description.trim() || null,
      imageUrl: values.imageUrl.trim() || null,
      defaultDeliveryUrl: values.defaultDeliveryUrl.trim() || null,
    }).catch(() => undefined);
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Editar produto" : "Novo produto"}
      description="O produto não tem preço — preço é atributo da oferta."
    >
      <form id="product-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          label="Nome"
          placeholder="Curso de tráfego pago"
          value={values.name}
          error={errors.name}
          maxLength={120}
          onChange={(event) => setField("name", event.target.value)}
        />

        <TextareaField
          label="Descrição"
          placeholder="Opcional. Aparece nas telas que usam este produto."
          value={values.description}
          onChange={(event) => setField("description", event.target.value)}
        />

        <TextField
          label="URL da imagem"
          placeholder="https://..."
          value={values.imageUrl}
          error={errors.imageUrl}
          inputMode="url"
          onChange={(event) => setField("imageUrl", event.target.value)}
        />

        <TextField
          label="URL do entregável padrão"
          placeholder="https://..."
          value={values.defaultDeliveryUrl}
          error={errors.defaultDeliveryUrl}
          inputMode="url"
          hint="Ofertas sem entregável próprio herdam esta URL."
          onChange={(event) => setField("defaultDeliveryUrl", event.target.value)}
        />

        {hasSaveProductError && (
          <p role="alert" className="animate-fade-in text-red-600 text-sm">
            {saveProductErrorMessage}
          </p>
        )}
      </form>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" form="product-form" size="sm" isLoading={isSavingProduct}>
          {product ? "Salvar alterações" : "Criar produto"}
        </Button>
      </div>
    </Dialog>
  );
}
