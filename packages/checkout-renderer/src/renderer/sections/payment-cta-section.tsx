import { LockIcon, SpinnerIcon } from "../../internal/icons";
import { bodySize } from "../../lib/checkout-theme";
import type { PaymentCtaProps } from "../../types/checkout-schema";
import { CHECKOUT_FORM_ID, useRendererContext } from "../renderer-context";
import { SectionContainer, Surface } from "../renderer-primitives";

interface PaymentCtaSectionProps {
  props: PaymentCtaProps;
}

/** Botão, selo de segurança e o texto legal — o fecho do cartão de pagamento. */
export function PaymentCtaSection({ props }: PaymentCtaSectionProps) {
  const { form } = useRendererContext();

  return (
    <SectionContainer>
      <Surface className="p-4">
        <button
          type="submit"
          form={CHECKOUT_FORM_ID}
          disabled={form?.isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 px-6 font-semibold transition-[opacity,scale] duration-200 ease-out active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            backgroundColor: "var(--lc-primary)",
            color: "var(--lc-primary-text)",
            borderRadius: "var(--lc-radius-button)",
            fontSize: bodySize(0.95),
          }}
        >
          {form?.isSubmitting && <SpinnerIcon className="size-4 animate-spin" />}
          {props.label}
        </button>

        {form?.submitErrorMessage && (
          <p
            role="alert"
            className="mt-3 text-center"
            style={{ color: "#dc2626", fontSize: bodySize(0.82) }}
          >
            {form.submitErrorMessage}
          </p>
        )}

        {props.showSecurityNote && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--lc-background)", color: "var(--lc-muted)" }}
            >
              <LockIcon className="size-3.5" />
            </span>
            <div>
              <p
                className="font-semibold"
                style={{ color: "var(--lc-text)", fontSize: bodySize(0.76) }}
              >
                Ambiente seguro
              </p>
              <p style={{ color: "var(--lc-muted)", fontSize: bodySize(0.72) }}>
                Seus dados são confidenciais
              </p>
            </div>
          </div>
        )}

        {props.helperText.trim() && (
          <p
            className="mx-auto mt-3 max-w-[26rem] text-center leading-relaxed"
            style={{ color: "var(--lc-muted)", fontSize: bodySize(0.68) }}
          >
            {props.helperText}
          </p>
        )}
      </Surface>
    </SectionContainer>
  );
}
