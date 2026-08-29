import {
  Heading,
  SectionContainer,
  Surface,
  Text,
} from "@/features/checkouts/components/renderer/renderer-primitives";
import { bodySize } from "@/features/checkouts/lib/checkout-theme";
import type { GuaranteeProps } from "@/features/checkouts/types/checkout-schema";
import { ShieldCheckIcon } from "@/shared/ui/icons";

interface GuaranteeSectionProps {
  props: GuaranteeProps;
}

export function GuaranteeSection({ props }: GuaranteeSectionProps) {
  return (
    <SectionContainer>
      <Surface className="flex flex-col gap-4 p-5 @xl:flex-row @xl:items-center @xl:p-6">
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--lc-primary)", color: "var(--lc-primary-text)" }}
        >
          <ShieldCheckIcon className="size-6" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Heading size={1.1}>{props.title}</Heading>
            {props.days > 0 && (
              <span
                className="rounded-full px-2.5 py-0.5 font-medium"
                style={{
                  backgroundColor: "var(--lc-background)",
                  color: "var(--lc-muted)",
                  fontSize: bodySize(0.72),
                }}
              >
                {props.days} dias
              </span>
            )}
          </div>

          {props.description.trim() && (
            <Text isMuted size={0.9} className="mt-1.5">
              {props.description}
            </Text>
          )}
        </div>
      </Surface>
    </SectionContainer>
  );
}
