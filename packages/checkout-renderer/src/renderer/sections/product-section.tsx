import { formatCurrency } from "../../internal/format-currency";
import { PackageIcon } from "../../internal/icons";
import { bodySize } from "../../lib/checkout-theme";
import type { ProductProps } from "../../types/checkout-schema";
import { useRendererContext } from "../renderer-context";
import { SectionContainer, Surface, Text } from "../renderer-primitives";

interface ProductSectionProps {
  props: ProductProps;
}

/**
 * Nome, descrição e preço vêm de Offer/Product — o schema só sobrescreve se
 * quiser. É uma linha compacta, não um bloco de venda: quem chegou no checkout
 * já decidiu, e só precisa confirmar o que está comprando.
 */
export function ProductSection({ props }: ProductSectionProps) {
  const { content } = useRendererContext();

  const title = props.title.trim() || content.offerName || content.productName;
  const description = props.description.trim() || content.productDescription;
  const imageUrl = props.imageUrl.trim() || content.productImageUrl;

  return (
    <SectionContainer>
      <Surface className="flex items-start gap-3.5 p-4">
        <div
          className="flex size-14 shrink-0 items-center justify-center overflow-hidden"
          style={{
            borderRadius: "calc(var(--lc-radius) * 0.6)",
            backgroundColor: "var(--lc-background)",
            color: "var(--lc-muted)",
          }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <PackageIcon className="size-6" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {props.badgeLabel.trim() && (
            <span
              className="mb-1.5 inline-flex items-center rounded-full px-2 py-0.5 font-medium"
              style={{
                backgroundColor: "var(--lc-primary)",
                color: "var(--lc-primary-text)",
                fontSize: bodySize(0.66),
              }}
            >
              {props.badgeLabel}
            </span>
          )}

          <p
            className="font-semibold leading-snug"
            style={{ color: "var(--lc-text)", fontSize: bodySize(0.92) }}
          >
            {title}
          </p>

          {props.showPrice && (
            <p
              className="mt-0.5 font-bold tracking-tight"
              style={{ color: "var(--lc-primary)", fontSize: bodySize(1.05) }}
            >
              {content.priceInCents === null
                ? "R$ —"
                : formatCurrency(content.priceInCents, content.currency)}
            </p>
          )}

          {description && (
            <Text isMuted size={0.8} className="mt-1 line-clamp-2">
              {description}
            </Text>
          )}
        </div>
      </Surface>
    </SectionContainer>
  );
}
