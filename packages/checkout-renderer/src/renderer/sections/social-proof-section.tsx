import { cn } from "../../internal/cn";
import { bodySize } from "../../lib/checkout-theme";
import type { SocialProofProps, TestimonialItem } from "../../types/checkout-schema";
import { Heading, SectionContainer, StarRating, Surface, Text } from "../renderer-primitives";
import { useSelectableItem } from "../selectable-item";

interface SocialProofSectionProps {
  props: SocialProofProps;
}

export function SocialProofSection({ props }: SocialProofSectionProps) {
  const hasHeader = props.title.trim().length > 0 || props.subtitle.trim().length > 0;

  return (
    <SectionContainer>
      {hasHeader && (
        <div className="mb-2 px-1">
          {props.title.trim() && <Heading size={1.1}>{props.title}</Heading>}
          {props.subtitle.trim() && (
            <Text isMuted size={0.85} className="mt-1">
              {props.subtitle}
            </Text>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {props.items.map((item, index) => (
          <TestimonialCard key={item.id} item={item} index={index} total={props.items.length} />
        ))}
      </div>
    </SectionContainer>
  );
}

/** Depoimento no formato de comentário: quem falou primeiro, o que disse depois. */
function TestimonialCard({
  item,
  index,
  total,
}: {
  item: TestimonialItem;
  index: number;
  total: number;
}) {
  const selectable = useSelectableItem("items", item.id, item.name, { index, total });

  return (
    <Surface
      className={cn("flex flex-col gap-2.5 p-4", selectable.className)}
      {...selectable.dragProps}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full font-semibold"
          style={{
            backgroundColor: "var(--lc-primary)",
            color: "var(--lc-primary-text)",
            fontSize: bodySize(0.7),
          }}
        >
          {toInitials(item.name)}
        </span>

        <div className="min-w-0">
          <Text size={0.85} className="font-medium">
            {item.name}
          </Text>
          <div className="mt-0.5 flex items-center gap-2">
            <StarRating rating={item.rating} />
            {item.role.trim() && (
              <Text isMuted size={0.75}>
                {item.role}
              </Text>
            )}
          </div>
        </div>
      </div>

      <Text size={0.85}>{item.quote}</Text>
      {selectable.overlay}
      {selectable.toolbar}
    </Surface>
  );
}

function toInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts.at(0)?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? "") : "";
  const initials = `${first}${last}`.toUpperCase();

  return initials || "?";
}
