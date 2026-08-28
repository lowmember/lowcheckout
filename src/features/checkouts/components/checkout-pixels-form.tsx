import { useEffect, useState } from "react";

import { useCheckoutPixels } from "@/features/checkouts/hooks/use-checkout-pixels";
import type { CheckoutPixelInput, PixelProvider } from "@/features/checkouts/types/checkout";
import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { InfoIcon } from "@/shared/ui/icons";
import { TextField } from "@/shared/ui/text-field";

const PROVIDER_LABELS: Record<PixelProvider, string> = {
  facebook: "Facebook",
  utmify: "Utmify",
};

const PROVIDER_PLACEHOLDERS: Record<PixelProvider, string> = {
  facebook: "1234567890123456",
  utmify: "utm-xxxxxxxx",
};

const PROVIDERS = Object.keys(PROVIDER_LABELS) as PixelProvider[];

const PROVIDER_PATTERNS: Record<PixelProvider, RegExp> = {
  facebook: /^\d{10,20}$/,
  utmify: /^[\w-]{6,64}$/,
};

type PixelValues = Record<PixelProvider, string>;

const EMPTY_VALUES: PixelValues = { facebook: "", utmify: "" };

interface CheckoutPixelsFormProps {
  checkoutId: string;
}

export function CheckoutPixelsForm({ checkoutId }: CheckoutPixelsFormProps) {
  const {
    pixels,
    isLoadingPixels,
    hasPixelsError,
    savePixels,
    isSavingPixels,
    didSavePixels,
    savePixelsErrorMessage,
  } = useCheckoutPixels(checkoutId);

  const [values, setValues] = useState<PixelValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<PixelValues>>({});

  useEffect(() => {
    const next = { ...EMPTY_VALUES };
    for (const pixel of pixels) next[pixel.provider] = pixel.externalId;
    setValues(next);
  }, [pixels]);

  async function handleSave() {
    const validationErrors: Partial<PixelValues> = {};

    for (const provider of PROVIDERS) {
      const value = values[provider].trim();
      if (value && !PROVIDER_PATTERNS[provider].test(value)) {
        validationErrors[provider] = "Identificador em formato inválido.";
      }
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // `accessToken` fica de fora: a API nunca devolve o token gravado, então
    // reenviá-lo seria mandar `null` e apagar o que já está lá. Omitir preserva.
    const payload: CheckoutPixelInput[] = PROVIDERS.filter(
      (provider) => values[provider].trim().length > 0,
    ).map((provider) => ({
      provider,
      externalId: values[provider].trim(),
      isEnabled: true,
    }));

    await savePixels(payload).catch(() => undefined);
  }

  return (
    <Card>
      <CardHeader
        title="Tracking e pixels"
        description="Configurado por checkout — cada campanha carrega só o seu pixel."
      />

      <CardBody className="space-y-5">
        {hasPixelsError && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-amber-800 text-xs leading-relaxed">
            <InfoIcon className="mt-px size-4 shrink-0" />
            Não foi possível carregar os pixels deste checkout. Salvar vai sobrescrever o que
            estiver gravado.
          </p>
        )}

        {PROVIDERS.map((provider) => (
          <TextField
            key={provider}
            label={`Pixel do ${PROVIDER_LABELS[provider]}`}
            placeholder={PROVIDER_PLACEHOLDERS[provider]}
            value={values[provider]}
            error={errors[provider]}
            disabled={isLoadingPixels}
            hint="Deixe em branco para não carregar este pixel."
            onChange={(event) => {
              const nextValue = event.target.value;
              setValues((current) => ({ ...current, [provider]: nextValue }));
              setErrors((current) => ({ ...current, [provider]: undefined }));
            }}
          />
        ))}

        {savePixelsErrorMessage && (
          <p role="alert" className="animate-fade-in text-red-600 text-sm">
            {savePixelsErrorMessage}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button size="sm" isLoading={isSavingPixels} onClick={() => void handleSave()}>
            Salvar pixels
          </Button>
          {didSavePixels && !savePixelsErrorMessage && (
            <span className="animate-fade-in text-emerald-600 text-xs">Pixels salvos.</span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
