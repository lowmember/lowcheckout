import type { PublicOrder } from "@lowcheckout/contracts";

import { formatCurrency } from "../internal/format-currency";
import { CheckIcon } from "../internal/icons";
import { bodySize } from "../lib/checkout-theme";
import { CheckoutThemeShell } from "../renderer/checkout-theme-shell";
import { Heading, SectionContainer, Surface, Text } from "../renderer/renderer-primitives";
import type { CheckoutContent } from "../types/checkout-content";
import type { CheckoutTheme } from "../types/checkout-schema";

interface ThankYouScreenProps {
  theme: CheckoutTheme;
  content: CheckoutContent;
  order: PublicOrder;
}

/**
 * Confirmação do pagamento e entrega (RF-PUB-06).
 *
 * O valor e o nome saem do **pedido**, não do checkout: é o que foi realmente
 * cobrado. `deliveryUrl` só chega preenchido quando a API confirma o pedido
 * pago — quando falta, a tela promete só o e-mail, e nunca um link que não tem.
 */
export function ThankYouScreen({ theme, content, order }: ThankYouScreenProps) {
  const firstName = order.buyerName.trim().split(/\s+/)[0];

  return (
    <CheckoutThemeShell theme={theme} className="min-h-screen">
      <SectionContainer>
        <Surface className="flex flex-col items-center gap-4 p-7 text-center @xl:p-10">
          <span
            className="flex size-14 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--lc-primary)", color: "var(--lc-primary-text)" }}
          >
            <CheckIcon className="size-7 animate-pop-in" />
          </span>

          <Heading as="h1" size={1.7}>
            {firstName ? `Pagamento confirmado, ${firstName}!` : "Pagamento confirmado!"}
          </Heading>

          <Text isMuted className="max-w-[32rem]">
            Enviamos os dados de acesso para o e-mail informado. Se não encontrar, confira a caixa
            de spam antes de falar com o suporte.
          </Text>

          {order.deliveryUrl !== null && (
            <a
              href={order.deliveryUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-12 w-full max-w-sm items-center justify-center font-semibold transition-opacity duration-200 active:opacity-90"
              style={{
                backgroundColor: "var(--lc-primary)",
                color: "var(--lc-primary-text)",
                borderRadius: "var(--lc-radius-button)",
                fontSize: bodySize(0.95),
              }}
            >
              Acessar meu produto
            </a>
          )}

          <div className="mt-2 w-full border-t pt-4" style={{ borderColor: "var(--lc-border)" }}>
            <div className="flex items-center justify-between gap-3">
              <Text isMuted size={0.85}>
                {order.offerName || order.productName}
              </Text>
              <Text size={0.9} className="font-semibold">
                {formatCurrency(order.amountInCents, order.currency)}
              </Text>
            </div>
          </div>

          <p style={{ color: "var(--lc-muted)", fontSize: bodySize(0.78) }}>
            {content.displayName}
          </p>
        </Surface>
      </SectionContainer>
    </CheckoutThemeShell>
  );
}
