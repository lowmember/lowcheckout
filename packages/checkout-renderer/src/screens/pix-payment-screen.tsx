import type { PublicOrder } from "@lowcheckout/contracts";

import { formatCurrency } from "../internal/format-currency";
import { CheckIcon, ClockIcon, CopyIcon, QrCodeIcon, SpinnerIcon } from "../internal/icons";
import { useCopyToClipboard } from "../internal/use-copy-to-clipboard";
import { formatCountdown, useCountdown } from "../internal/use-countdown";
import { bodySize, headingSize } from "../lib/checkout-theme";
import { CheckoutThemeShell } from "../renderer/checkout-theme-shell";
import { Heading, SectionContainer, Surface, Text } from "../renderer/renderer-primitives";
import type { CheckoutTheme } from "../types/checkout-schema";

interface PixPaymentScreenProps {
  theme: CheckoutTheme;
  order: PublicOrder;
}

/**
 * Tela de PIX, no mesmo tema do checkout — o comprador não percebe a troca.
 *
 * A cobrança (`order.pix`) é nula enquanto o gateway não devolve o QR Code, e
 * `qrCodePayload` pode faltar mesmo com cobrança criada. Nenhum dos dois pode
 * virar tela quebrada: o que existe aparece, o que falta some.
 */
export function PixPaymentScreen({ theme, order }: PixPaymentScreenProps) {
  const { copy, copiedValue } = useCopyToClipboard();

  const payload = order.pix?.qrCodePayload ?? null;
  const imageUrl = order.pix?.qrCodeImageUrl ?? null;
  const wasCopied = payload !== null && copiedValue === payload;

  const remainingSeconds = useCountdown(order.pix?.expiresAt ?? order.expiresAt);
  const hasExpired = order.status === "expired" || remainingSeconds === 0;

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
              {imageUrl ? (
                <img src={imageUrl} alt="QR Code do PIX" className="size-full" />
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

            {payload !== null && (
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
                  {payload}
                </p>

                <button
                  type="button"
                  onClick={() => void copy(payload)}
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
            )}
          </div>
        </Surface>

        <p
          className="mt-5 flex items-center justify-center gap-2"
          style={{ color: "var(--lc-muted)", fontSize: bodySize(0.82) }}
        >
          {hasExpired ? (
            <>
              <ClockIcon className="size-4" />
              Este PIX expirou. Recarregue a página para gerar um novo.
            </>
          ) : (
            <>
              <SpinnerIcon className="size-4" />
              Aguardando confirmação do pagamento
              {remainingSeconds !== null && (
                <>
                  {" · expira em "}
                  <span className="font-mono font-medium tabular-nums">
                    {formatCountdown(remainingSeconds)}
                  </span>
                </>
              )}
            </>
          )}
        </p>
      </SectionContainer>
    </CheckoutThemeShell>
  );
}
