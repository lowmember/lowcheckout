import {
  Heading,
  SectionContainer,
  Text,
} from "@/features/checkouts/components/renderer/renderer-primitives";
import { useSelectableItem } from "@/features/checkouts/components/renderer/selectable-item";
import type { FaqItem, FaqProps } from "@/features/checkouts/types/checkout-schema";
import { cn } from "@/shared/lib/cn";
import { ChevronDownIcon } from "@/shared/ui/icons";

interface FaqSectionProps {
  props: FaqProps;
}

/** `<details>` nativo: acessível por teclado e sem estado no renderer. */
export function FaqSection({ props }: FaqSectionProps) {
  return (
    <SectionContainer>
      <Heading>{props.title}</Heading>

      <div
        className="mt-5 overflow-hidden border"
        style={{ borderColor: "var(--lc-border)", borderRadius: "var(--lc-radius)" }}
      >
        {props.items.map((item, index) => (
          <FaqRow key={item.id} item={item} isFirst={index === 0} />
        ))}
      </div>
    </SectionContainer>
  );
}

function FaqRow({ item, isFirst }: { item: FaqItem; isFirst: boolean }) {
  const selectable = useSelectableItem("items", item.id, item.question);

  return (
    <details
      className={cn("group", selectable.className)}
      style={{
        borderTopWidth: isFirst ? 0 : 1,
        borderTopStyle: "solid",
        borderTopColor: "var(--lc-border)",
        backgroundColor: "var(--lc-surface)",
      }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5">
        <Text size={0.92} className="font-medium">
          {item.question}
        </Text>
        <ChevronDownIcon
          className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
          style={{ color: "var(--lc-muted)" }}
        />
        {/* Dentro do summary de propósito: no `<details>` fechado o resto do
            conteúdo não é renderizado, e o overlay sumiria junto. */}
        {selectable.overlay}
      </summary>

      <div className="px-4 pb-4">
        <Text isMuted size={0.88}>
          {item.answer}
        </Text>
      </div>
    </details>
  );
}
