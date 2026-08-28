import { useRendererContext } from "@/features/checkouts/components/renderer/renderer-context";
import {
  Heading,
  SectionContainer,
  Surface,
  Text,
} from "@/features/checkouts/components/renderer/renderer-primitives";
import { bodySize, headingSize } from "@/features/checkouts/lib/checkout-theme";
import type { ProductProps } from "@/features/checkouts/types/checkout-schema";
import { formatCurrency } from "@/shared/lib/format-currency";
import { PackageIcon } from "@/shared/ui/icons";

interface ProductSectionProps {
  props: ProductProps;
}

/** Nome, descrição e preço vêm de Offer/Product — o schema só sobrescreve se quiser. */
export function ProductSection({ props }: ProductSectionProps) {
  const { content } = useRendererContext();

  const title = props.title.trim() || content.offerName || content.productName;
  const description = props.description.trim() || content.productDescription;
  const imageUrl = props.imageUrl.trim() || content.productImageUrl;

  return (
    <SectionContainer>
      <Surface className="flex flex-col gap-5 p-5 @xl:flex-row @xl:items-center @xl:p-6">
        <div
          className="flex size-20 shrink-0 items-center justify-center overflow-hidden @xl:size-24"
          style={{
            borderRadius: "calc(var(--lc-radius) * 0.75)",
            backgroundColor: "var(--lc-background)",
            color: "var(--lc-muted)",
          }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <PackageIcon className="size-7" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {props.badgeLabel.trim() && (
            <span
              className="mb-2 inline-flex items-center rounded-full px-2.5 py-1 font-medium"
              style={{
                backgroundColor: "var(--lc-primary)",
                color: "var(--lc-primary-text)",
                fontSize: bodySize(0.7),
              }}
            >
              {props.badgeLabel}
            </span>
          )}

          <Heading size={1.15}>{title}</Heading>

          {description && (
            <Text isMuted size={0.9} className="mt-1.5">
              {description}
            </Text>
          )}
        </div>

        {props.showPrice && (
          <div className="shrink-0 @xl:text-right">
            <p
              className="font-medium uppercase tracking-wide"
              style={{ color: "var(--lc-muted)", fontSize: bodySize(0.68) }}
            >
              Total
            </p>
            <p
              className="font-semibold tracking-tight"
              style={{ color: "var(--lc-text)", fontSize: headingSize(1.6) }}
            >
              {content.priceInCents === null
                ? "R$ —"
                : formatCurrency(content.priceInCents, content.currency)}
            </p>
          </div>
        )}
      </Surface>
    </SectionContainer>
  );
}
