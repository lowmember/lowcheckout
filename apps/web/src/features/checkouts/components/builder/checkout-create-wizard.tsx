import type { CheckoutTemplateId } from "@lowcheckout/checkout-renderer";
import { DEFAULT_TEMPLATE, getCheckoutTemplate } from "@lowcheckout/checkout-renderer";
import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";

import { TemplateGallery } from "@/features/checkouts/components/builder/template-gallery";
import { useCreateCheckoutFromTemplate } from "@/features/checkouts/hooks/use-create-checkout-from-template";
import { useProductOffers } from "@/features/offers";
import { useProducts } from "@/features/products";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Button } from "@/shared/ui/button";
import { Card, CardBody } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ArrowLeftIcon, ArrowRightIcon, PackageIcon, SparklesIcon } from "@/shared/ui/icons";
import { SelectField } from "@/shared/ui/select-field";
import { Skeleton } from "@/shared/ui/skeleton";
import { TextField } from "@/shared/ui/text-field";

type WizardStep = "template" | "details";

interface DetailsErrors {
  productId?: string;
  offerId?: string;
  internalTitle?: string;
  displayName?: string;
}

/** Criação em etapas: template → produto/oferta → editor. */
export function CheckoutCreateWizard() {
  const navigate = useNavigate();

  const [step, setStep] = useState<WizardStep>("template");
  /** Só existe um template: ele já vem escolhido, e a etapa serve de prévia. */
  const [templateId, setTemplateId] = useState<CheckoutTemplateId | null>(DEFAULT_TEMPLATE.id);
  const [productId, setProductId] = useState("");
  const [offerId, setOfferId] = useState("");
  const [internalTitle, setInternalTitle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState<DetailsErrors>({});

  const { products, isLoadingProducts } = useProducts();
  const { offers, isLoadingOffers } = useProductOffers(productId);
  const {
    createCheckoutFromTemplate,
    isCreatingCheckout,
    hasCreateCheckoutError,
    createCheckoutErrorMessage,
  } = useCreateCheckoutFromTemplate();

  useEffect(() => {
    if (!productId && products.length > 0) setProductId(products[0].id);
  }, [productId, products]);

  useEffect(() => {
    setOfferId(offers[0]?.id ?? "");
  }, [offers]);

  const template = templateId ? getCheckoutTemplate(templateId) : undefined;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!templateId) return;

    const nextErrors: DetailsErrors = {};
    if (!productId) nextErrors.productId = "Escolha um produto.";
    if (!offerId) nextErrors.offerId = "Escolha a oferta que este checkout vende.";
    if (!internalTitle.trim()) nextErrors.internalTitle = "Informe o título interno.";
    if (!displayName.trim()) nextErrors.displayName = "Informe o nome de exibição.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const checkout = await createCheckoutFromTemplate({
      templateId,
      productId,
      offerId,
      internalTitle: internalTitle.trim(),
      displayName: displayName.trim(),
    }).catch(() => null);

    if (!checkout) return;

    navigate({ to: "/checkouts/$checkoutId/editor", params: { checkoutId: checkout.id } });
  }

  if (step === "template") {
    return (
      <div className="space-y-6">
        <TemplateGallery selectedTemplateId={templateId} onSelect={setTemplateId} />

        <footer className="sticky bottom-0 flex items-center justify-between gap-4 border-neutral-200 border-t bg-white/90 py-4 backdrop-blur">
          <p className="text-neutral-500 text-sm">
            {template
              ? `Template selecionado: ${template.name}`
              : "Escolha o template para seguir."}
          </p>
          <Button disabled={!templateId} onClick={() => setStep("details")}>
            Continuar
            <ArrowRightIcon className="size-4" />
          </Button>
        </footer>
      </div>
    );
  }

  if (isLoadingProducts) {
    return <Skeleton className="h-96 w-full max-w-xl" />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageIcon className="size-5" />}
        title="Cadastre um produto primeiro"
        description="Um checkout vende a oferta de um produto. Crie o produto e ao menos uma oferta para continuar."
        action={
          <Button size="sm" onClick={() => navigate({ to: "/produtos" })}>
            Ir para Produtos
          </Button>
        }
      />
    );
  }

  return (
    <div className="max-w-xl space-y-5">
      <button
        type="button"
        onClick={() => setStep("template")}
        className="inline-flex items-center gap-1.5 text-neutral-500 text-sm transition-colors hover:text-neutral-900"
      >
        <ArrowLeftIcon className="size-4" />
        Voltar para o template
      </button>

      {template && (
        <Card>
          <CardBody className="flex items-center gap-3 pt-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
              <SparklesIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-neutral-900 text-sm">{template.name}</p>
              <p className="mt-0.5 text-neutral-500 text-xs leading-relaxed">
                {template.description}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="pt-5">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <SelectField
              label="Produto"
              options={products.map((product) => ({ value: product.id, label: product.name }))}
              value={productId}
              error={errors.productId}
              hint="O produto de um checkout não pode ser trocado depois."
              onChange={(event) => setProductId(event.target.value)}
            />

            <SelectField
              label="Oferta"
              options={
                offers.length > 0
                  ? offers.map((offer) => ({
                      value: offer.id,
                      label: `${offer.name} · ${formatCurrency(offer.priceInCents, offer.currency)}`,
                    }))
                  : [
                      {
                        value: "",
                        label: isLoadingOffers ? "Carregando ofertas..." : "Nenhuma oferta",
                      },
                    ]
              }
              value={offerId}
              error={errors.offerId}
              disabled={offers.length === 0}
              hint="Nome e preço continuam vindo da oferta — o editor não os duplica."
              onChange={(event) => setOfferId(event.target.value)}
            />

            <TextField
              label="Título interno"
              placeholder="Campanha Black Friday"
              value={internalTitle}
              error={errors.internalTitle}
              maxLength={120}
              onChange={(event) => setInternalTitle(event.target.value)}
            />

            <TextField
              label="Nome de exibição"
              placeholder="Curso de tráfego pago"
              value={displayName}
              error={errors.displayName}
              maxLength={120}
              hint="Aparece na página pública do checkout."
              onChange={(event) => setDisplayName(event.target.value)}
            />

            {hasCreateCheckoutError && (
              <p role="alert" className="animate-fade-in text-red-600 text-sm">
                {createCheckoutErrorMessage}
              </p>
            )}

            <Button type="submit" className="w-full" isLoading={isCreatingCheckout}>
              Criar e abrir o editor
              <ArrowRightIcon className="size-4" />
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
