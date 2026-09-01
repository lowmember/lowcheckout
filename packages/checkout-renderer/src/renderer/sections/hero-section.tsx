import { cn } from "../../internal/cn";
import { ImageIcon } from "../../internal/icons";
import { spaceSize } from "../../lib/checkout-theme";
import type { HeroProps } from "../../types/checkout-schema";
import { useRendererContext } from "../renderer-context";
import { Eyebrow, Heading, SectionContainer, Text } from "../renderer-primitives";

interface HeroSectionProps {
  props: HeroProps;
}

export function HeroSection({ props }: HeroSectionProps) {
  const { content, viewport } = useRendererContext();

  const checkoutBanner =
    viewport === "mobile"
      ? (content.bannerMobileUrl ?? content.bannerDesktopUrl)
      : content.bannerDesktopUrl;
  const bannerUrl = props.imageUrl.trim() || checkoutBanner;
  const isCentered = props.alignment === "center";

  return (
    <SectionContainer isBleed style={{ paddingBlock: 0 }}>
      {props.showBanner &&
        (bannerUrl ? (
          <img
            src={bannerUrl}
            alt=""
            className="aspect-[1200/420] w-full object-cover @2xl:aspect-[1200/260]"
          />
        ) : (
          <div
            className="flex aspect-[1200/420] w-full items-center justify-center gap-2 @2xl:aspect-[1200/260]"
            style={{ backgroundColor: "var(--lc-surface)", color: "var(--lc-muted)" }}
          >
            <ImageIcon className="size-5" />
            <span className="text-xs">Banner do checkout</span>
          </div>
        ))}

      <div
        className="mx-auto w-full max-w-[46rem] px-5 @2xl:px-8"
        style={{ paddingBlock: spaceSize(2.25) }}
      >
        <div className={cn("flex flex-col gap-3", isCentered && "items-center text-center")}>
          {props.eyebrow.trim() && <Eyebrow>{props.eyebrow}</Eyebrow>}

          <Heading as="h1" size={2}>
            {props.title}
          </Heading>

          {props.subtitle.trim() && (
            <Text isMuted size={1.05} className={cn("max-w-[36rem]", isCentered && "mx-auto")}>
              {props.subtitle}
            </Text>
          )}
        </div>
      </div>
    </SectionContainer>
  );
}
