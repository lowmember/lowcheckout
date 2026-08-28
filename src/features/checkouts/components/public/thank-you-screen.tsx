import { CheckoutThemeShell } from "@/features/checkouts/components/renderer/checkout-theme-shell";
import {
  Heading,
  SectionContainer,
  Surface,
  Text,
} from "@/features/checkouts/components/renderer/renderer-primitives";
import { bodySize } from "@/features/checkouts/lib/checkout-theme";
import type { CheckoutTheme } from "@/features/checkouts/types/checkout-schema";
import type { CheckoutContent } from "@/features/checkouts/types/checkout-content";
import { formatCurrency } from "@/shared/lib/format-currency";
import { CheckIcon } from "@/shared/ui/icons";

interface ThankYouScreenProps {
  theme: CheckoutTheme;
  content: CheckoutContent;
  buyerName: string;
}

export function ThankYouScreen({ theme, content, buyerName }: ThankYouScreenProps) {
  const firstName = buyerName.split(/\s+/)[0];

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

          <div
            className="mt-2 w-full border-t pt-4"
            style={{ borderColor: "var(--lc-border)" }}
          >
            <div className="flex items-center justify-between gap-3">
              <Text isMuted size={0.85}>
                {content.offerName ?? content.productName}
              </Text>
              <Text size={0.9} className="font-semibold">
                {content.priceInCents === null
                  ? "—"
                  : formatCurrency(content.priceInCents, content.currency)}
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
