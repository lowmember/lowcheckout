import type { ComponentProps } from "react";
import { useId } from "react";

import { formatCurrency } from "../../internal/format-currency";
import { maskCpf } from "../../internal/masks";
import { bodySize } from "../../lib/checkout-theme";
import type { BuyerFormValues } from "../../types/checkout-buyer";
import type { CheckoutFormProps } from "../../types/checkout-schema";
import { CHECKOUT_FORM_ID, useRendererContext } from "../renderer-context";
import { Heading, SectionContainer, Surface, Text } from "../renderer-primitives";

interface CheckoutFormSectionProps {
  props: CheckoutFormProps;
}

/** `className` fica no invólucro, não no input: é o que faz um campo ocupar as duas colunas. */
interface BuyerFieldProps extends Omit<ComponentProps<"input">, "id" | "style"> {
  label: string;
  error?: string;
}

function BuyerField({ label, error, className, ...props }: BuyerFieldProps) {
  const id = useId();

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1 block font-medium"
        style={{ color: "var(--lc-text)", fontSize: bodySize(0.78) }}
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className="h-10 w-full border px-3 outline-none transition-[border-color] duration-200"
        style={{
          backgroundColor: "var(--lc-surface)",
          borderColor: error ? "#dc2626" : "var(--lc-border)",
          borderRadius: "var(--lc-radius-input)",
          color: "var(--lc-text)",
          fontSize: bodySize(0.88),
        }}
        {...props}
      />
      {error && (
        <p className="mt-1" style={{ color: "#dc2626", fontSize: bodySize(0.74) }}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Nome, e-mail e CPF são obrigatórios no MVP: o schema controla títulos e
 * resumo, nunca quais campos existem. O resumo do pedido fecha o cartão porque
 * é a última coisa que o comprador lê antes do botão da seção seguinte.
 */
export function CheckoutFormSection({ props }: CheckoutFormSectionProps) {
  const { content, form } = useRendererContext();

  const values: BuyerFormValues = form?.values ?? { name: "", email: "", document: "" };
  const errors = form?.errors ?? {};
  const hasHeader = props.title.trim().length > 0 || props.description.trim().length > 0;

  return (
    <SectionContainer>
      <Surface className="p-4">
        {hasHeader && (
          <div className="mb-4">
            {props.title.trim() && <Heading size={1}>{props.title}</Heading>}
            {props.description.trim() && (
              <Text isMuted size={0.82} className="mt-0.5">
                {props.description}
              </Text>
            )}
          </div>
        )}

        <form
          id={CHECKOUT_FORM_ID}
          noValidate
          className="grid gap-3.5 @xl:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            form?.onSubmit();
          }}
        >
          <BuyerField
            label="Seu e-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Insira seu e-mail"
            value={values.email}
            error={errors.email}
            readOnly={!form}
            onChange={(event) => form?.setField("email", event.target.value)}
          />

          <BuyerField
            label="CPF"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Insira seu CPF"
            value={values.document}
            error={errors.document}
            readOnly={!form}
            onChange={(event) => form?.setField("document", maskCpf(event.target.value))}
          />

          <BuyerField
            label="Nome completo"
            className="@xl:col-span-2"
            autoComplete="name"
            placeholder="Insira seu nome completo"
            value={values.name}
            error={errors.name}
            readOnly={!form}
            onChange={(event) => form?.setField("name", event.target.value)}
          />
        </form>

        {props.showOrderSummary && (
          <div
            className="mt-4 flex items-center justify-between gap-3 border-t pt-3.5"
            style={{ borderColor: "var(--lc-border)" }}
          >
            <p
              className="min-w-0 truncate font-medium uppercase tracking-wide"
              style={{ color: "var(--lc-muted)", fontSize: bodySize(0.72) }}
            >
              {content.offerName ?? content.productName}
            </p>
            <span
              className="shrink-0 font-bold tracking-tight"
              style={{ color: "var(--lc-text)", fontSize: bodySize(1) }}
            >
              {content.priceInCents === null
                ? "R$ —"
                : formatCurrency(content.priceInCents, content.currency)}
            </span>
          </div>
        )}
      </Surface>
    </SectionContainer>
  );
}
