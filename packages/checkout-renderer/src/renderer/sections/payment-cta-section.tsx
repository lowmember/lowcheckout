import { LockIcon, SpinnerIcon } from "../../internal/icons";
import { bodySize } from "../../lib/checkout-theme";
import type { PaymentCtaProps } from "../../types/checkout-schema";
import { CHECKOUT_FORM_ID, useRendererContext } from "../renderer-context";
import { SectionContainer, Text } from "../renderer-primitives";

interface PaymentCtaSectionProps {
  props: PaymentCtaProps;
}

export function PaymentCtaSection({ props }: PaymentCtaSectionProps) {
  const { form } = useRendererContext();

  return (
    <SectionContainer style={{ paddingBlock: "0.5rem" }}>
      <button
        type="submit"
        form={CHECKOUT_FORM_ID}
        disabled={form?.isSubmitting}
        className="inline-flex h-13 w-full items-center justify-center gap-2 px-6 font-semibold transition-[opacity,scale] duration-200 ease-out active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-70"
        style={{
          backgroundColor: "var(--lc-primary)",
          color: "var(--lc-primary-text)",
          borderRadius: "var(--lc-radius-button)",
          fontSize: bodySize(1),
        }}
      >
        {form?.isSubmitting && <SpinnerIcon className="size-4 animate-spin" />}
        {props.label}
      </button>

      {form?.submitErrorMessage && (
        <p
          role="alert"
          className="mt-3 text-center"
          style={{ color: "#dc2626", fontSize: bodySize(0.85) }}
        >
          {form.submitErrorMessage}
        </p>
      )}

      {props.helperText.trim() && (
        <Text isMuted size={0.85} className="mt-3 text-center">
          {props.helperText}
        </Text>
      )}

      {props.showSecurityNote && (
        <p
          className="mt-3 flex items-center justify-center gap-1.5"
          style={{ color: "var(--lc-muted)", fontSize: bodySize(0.75) }}
        >
          <LockIcon className="size-3.5" />
          Ambiente seguro. Seus dados não são compartilhados.
        </p>
      )}
    </SectionContainer>
  );
}
