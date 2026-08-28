import { CheckoutThemeShell } from "@/features/checkouts/components/renderer/checkout-theme-shell";
import {
  Heading,
  SectionContainer,
  Surface,
  Text,
} from "@/features/checkouts/components/renderer/renderer-primitives";
import { bodySize, headingSize } from "@/features/checkouts/lib/checkout-theme";
import type { CheckoutTheme } from "@/features/checkouts/types/checkout-schema";
import type { PixOrder } from "@/features/checkouts/types/public-checkout";
import { formatCurrency } from "@/shared/lib/format-currency";
import { useCopyToClipboard } from "@/shared/lib/use-copy-to-clipboard";
import { CheckIcon, ClockIcon, CopyIcon, QrCodeIcon, SpinnerIcon } from "@/shared/ui/icons";

interface PixPaymentScreenProps {
  theme: CheckoutTheme;
  order: PixOrder;
}

/** Tela de PIX, no mesmo tema do checkout — o comprador não percebe a troca. */
export function PixPaymentScreen({ theme, order }: PixPaymentScreenProps) {
  const { copy, copiedValue } = useCopyToClipboard();
  const wasCopied = copiedValue === order.qrCode;

  return (
    <CheckoutThemeShell theme={theme} className="min-h-screen">
      <SectionContainer>
        <div className="flex flex-col items-center gap-2 text-center">
          <Heading as="h1" size={1.6}>
            Falta só o pagamento
          </Heading>
          <Text isMuted>
            Abra o app do seu banco, escolha PIX e use o QR Code ou o código copia-e-cola.
          </Text>
        </div>

        <Surface className="mt-6 p-5 @xl:p-7">
          <div className="flex flex-col items-center gap-5">
            <div
              className="flex size-52 items-center justify-center overflow-hidden"
              style={{
                borderRadius: "calc(var(--lc-radius) * 0.75)",
                backgroundColor: "var(--lc-background)",
                color: "var(--lc-muted)",
              }}
            >
              {order.qrCodeImageUrl ? (
                <img src={order.qrCodeImageUrl} alt="QR Code do PIX" className="size-full" />
              ) : (
                <QrCodeIcon className="size-16" />
              )}
            </div>

            <div className="text-center">
              <p
                className="font-medium uppercase tracking-wide"
                style={{ color: "var(--lc-muted)", fontSize: bodySize(0.7) }}
              >
                Valor
              </p>
              <p
                className="font-semibold tracking-tight"
                style={{ color: "var(--lc-text)", fontSize: headingSize(1.8) }}
              >
                {formatCurrency(order.amountInCents, order.currency)}
              </p>
            </div>

            <div className="w-full">
              <p
                className="mb-1.5 font-medium"
                style={{ color: "var(--lc-text)", fontSize: bodySize(0.82) }}
              >
                Código copia-e-cola
              </p>
              <p
                className="break-all border px-3 py-2.5 font-mono"
                style={{
                  borderColor: "var(--lc-border)",
                  borderRadius: "var(--lc-radius-input)",
                  backgroundColor: "var(--lc-background)",
                  color: "var(--lc-muted)",
                  fontSize: bodySize(0.72),
                }}
              >
                {order.qrCode}
              </p>

              <button
                type="button"
                onClick={() => void copy(order.qrCode)}
                className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 font-semibold transition-opacity duration-200 active:opacity-90"
                style={{
                  backgroundColor: "var(--lc-primary)",
                  color: "var(--lc-primary-text)",
                  borderRadius: "var(--lc-radius-button)",
                  fontSize: bodySize(0.95),
                }}
              >
                {wasCopied ? (
                  <CheckIcon className="size-4 animate-pop-in" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
                {wasCopied ? "Código copiado" : "Copiar código PIX"}
              </button>
            </div>
          </div>
        </Surface>

        <p
          className="mt-5 flex items-center justify-center gap-2"
          style={{ color: "var(--lc-muted)", fontSize: bodySize(0.82) }}
        >
          {order.status === "expired" ? (
            <>
              <ClockIcon className="size-4" />
              Este PIX expirou. Recarregue a página para gerar um novo.
            </>
          ) : (
            <>
              <SpinnerIcon className="size-4 animate-spin" />
              Aguardando confirmação do pagamento…
            </>
          )}
        </p>
      </SectionContainer>
    </CheckoutThemeShell>
  );
}
