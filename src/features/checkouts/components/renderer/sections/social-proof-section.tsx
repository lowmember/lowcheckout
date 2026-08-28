import {
  Heading,
  SectionContainer,
  StarRating,
  Surface,
  Text,
} from "@/features/checkouts/components/renderer/renderer-primitives";
import type { SocialProofProps } from "@/features/checkouts/types/checkout-schema";
import { QuoteIcon } from "@/shared/ui/icons";

interface SocialProofSectionProps {
  props: SocialProofProps;
}

export function SocialProofSection({ props }: SocialProofSectionProps) {
  return (
    <SectionContainer>
      <Heading>{props.title}</Heading>
      {props.subtitle.trim() && (
        <Text isMuted className="mt-1.5">
          {props.subtitle}
        </Text>
      )}

      <div className="mt-5 grid gap-4 @xl:grid-cols-2">
        {props.items.map((item) => (
          <Surface key={item.id} className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <QuoteIcon className="size-5" style={{ color: "var(--lc-primary)" }} />
              <StarRating rating={item.rating} />
            </div>

            <Text size={0.92}>{item.quote}</Text>

            <div>
              <Text size={0.88} className="font-medium">
                {item.name}
              </Text>
              {item.role.trim() && (
                <Text isMuted size={0.8}>
                  {item.role}
                </Text>
              )}
            </div>
          </Surface>
        ))}
      </div>
    </SectionContainer>
  );
}
