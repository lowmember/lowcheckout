import type { ComponentProps } from "react";
import { useId } from "react";

import { formatCurrency } from "../../internal/format-currency";
import { maskCpf } from "../../internal/masks";
import { bodySize, headingSize } from "../../lib/checkout-theme";
import type { BuyerFormValues } from "../../types/checkout-buyer";
import type { CheckoutFormProps } from "../../types/checkout-schema";
import { CHECKOUT_FORM_ID, useRendererContext } from "../renderer-context";
import { Heading, SectionContainer, Surface, Text } from "../renderer-primitives";

interface CheckoutFormSectionProps {
  props: CheckoutFormProps;
}

interface BuyerFieldProps extends Omit<ComponentProps<"input">, "id" | "style"> {
  label: string;
  error?: string;
}

function BuyerField({ label, error, ...props }: BuyerFieldProps) {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-medium"
        style={{ color: "var(--lc-text)", fontSize: bodySize(0.82) }}
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className="h-11 w-full border px-3.5 outline-none transition-[border-color] duration-200"
        style={{
          backgroundColor: "var(--lc-background)",
          borderColor: error ? "#dc2626" : "var(--lc-border)",
          borderRadius: "var(--lc-radius-input)",
          color: "var(--lc-text)",
          fontSize: bodySize(0.92),
        }}
        {...props}
      />
      {error && (
        <p className="mt-1.5" style={{ color: "#dc2626", fontSize: bodySize(0.78) }}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Nome, e-mail e CPF são obrigatórios no MVP: o schema controla títulos e
 * resumo, nunca quais campos existem.
 */
export function CheckoutFormSection({ props }: CheckoutFormSectionProps) {
  const { content, form } = useRendererContext();

  const values: BuyerFormValues = form?.values ?? { name: "", email: "", document: "" };
  const errors = form?.errors ?? {};

  return (
    <SectionContainer>
      <div className="grid gap-5 @3xl:grid-cols-[1.35fr_1fr] @3xl:items-start">
        <Surface className="p-5 @xl:p-6">
          <Heading size={1.15}>{props.title}</Heading>
          {props.description.trim() && (
            <Text isMuted size={0.88} className="mt-1">
              {props.description}
            </Text>
          )}

          <form
            id={CHECKOUT_FORM_ID}
            noValidate
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              form?.onSubmit();
            }}
          >
            <BuyerField
              label="Nome completo"
              autoComplete="name"
              placeholder="Como no documento"
              value={values.name}
              error={errors.name}
              readOnly={!form}
              onChange={(event) => form?.setField("name", event.target.value)}
            />

            <BuyerField
              label="E-mail"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={values.email}
              error={errors.email}
              readOnly={!form}
              onChange={(event) => form?.setField("email", event.target.value)}
            />

            <BuyerField
              label="CPF"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              value={values.document}
              error={errors.document}
              readOnly={!form}
              onChange={(event) => form?.setField("document", maskCpf(event.target.value))}
            />
          </form>
        </Surface>

        {props.showOrderSummary && (
          <Surface className="p-5 @xl:p-6">
            <p
              className="font-medium uppercase tracking-wide"
              style={{ color: "var(--lc-muted)", fontSize: bodySize(0.68) }}
            >
              Resumo do pedido
            </p>

            <div className="mt-3 flex items-baseline justify-between gap-3">
              <Text size={0.88} isMuted>
                {content.offerName ?? content.productName}
              </Text>
              <span
                className="font-semibold tracking-tight"
                style={{ color: "var(--lc-text)", fontSize: headingSize(1.35) }}
              >
                {content.priceInCents === null
                  ? "R$ —"
                  : formatCurrency(content.priceInCents, content.currency)}
              </span>
            </div>

            <div
              className="mt-4 border-t pt-4"
              style={{ borderColor: "var(--lc-border)" }}
              aria-hidden="true"
            />

            <Text isMuted size={0.82}>
              {content.priceInCents === null
                ? "Vincule uma oferta para exibir o valor real."
                : "Pagamento via PIX, com confirmação na hora."}
            </Text>
          </Surface>
        )}
      </div>
    </SectionContainer>
  );
}
