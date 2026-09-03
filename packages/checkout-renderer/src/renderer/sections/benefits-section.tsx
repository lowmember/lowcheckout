import { cn } from "../../internal/cn";
import { CheckIcon } from "../../internal/icons";
import type { BenefitItem, BenefitsProps } from "../../types/checkout-schema";
import { Heading, SectionContainer, Surface, Text } from "../renderer-primitives";
import { useSelectableItem } from "../selectable-item";

interface BenefitsSectionProps {
  props: BenefitsProps;
}

export function BenefitsSection({ props }: BenefitsSectionProps) {
  return (
    <SectionContainer>
      <Surface className="p-4">
        {props.title.trim() && <Heading size={1.1}>{props.title}</Heading>}
        {props.subtitle.trim() && (
          <Text isMuted size={0.85} className="mt-1">
            {props.subtitle}
          </Text>
        )}

        <ul className="mt-3.5 grid gap-3 @xl:grid-cols-2">
          {props.items.map((item, index) => (
            <BenefitRow key={item.id} item={item} index={index} total={props.items.length} />
          ))}
        </ul>
      </Surface>
    </SectionContainer>
  );
}

function BenefitRow({ item, index, total }: { item: BenefitItem; index: number; total: number }) {
  const selectable = useSelectableItem("items", item.id, item.title, { index, total });

  return (
    <li className={cn("flex gap-3", selectable.className)} {...selectable.dragProps}>
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
      {selectable.overlay}
      {selectable.toolbar}
    </li>
  );
}
