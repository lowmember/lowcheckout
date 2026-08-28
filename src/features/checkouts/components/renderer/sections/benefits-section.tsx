import {
  Heading,
  SectionContainer,
  Text,
} from "@/features/checkouts/components/renderer/renderer-primitives";
import type { BenefitsProps } from "@/features/checkouts/types/checkout-schema";
import { CheckIcon } from "@/shared/ui/icons";

interface BenefitsSectionProps {
  props: BenefitsProps;
}

export function BenefitsSection({ props }: BenefitsSectionProps) {
  return (
    <SectionContainer>
      <Heading>{props.title}</Heading>
      {props.subtitle.trim() && (
        <Text isMuted className="mt-1.5">
          {props.subtitle}
        </Text>
      )}

      <ul className="mt-5 grid gap-4 @xl:grid-cols-2">
        {props.items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--lc-primary)", color: "var(--lc-primary-text)" }}
            >
              <CheckIcon className="size-3.5" />
            </span>
            <div className="min-w-0">
              <Text size={0.95} className="font-medium">
                {item.title}
              </Text>
              {item.description.trim() && (
                <Text isMuted size={0.85} className="mt-0.5">
                  {item.description}
                </Text>
              )}
            </div>
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}
