import { cn } from "../../internal/cn";
import { ShieldCheckIcon } from "../../internal/icons";
import { bodySize } from "../../lib/checkout-theme";
import type { FooterLinkItem, FooterProps } from "../../types/checkout-schema";
import { useRendererContext } from "../renderer-context";
import { SectionContainer } from "../renderer-primitives";
import { useSelectableItem } from "../selectable-item";

interface FooterSectionProps {
  props: FooterProps;
}

export function FooterSection({ props }: FooterSectionProps) {
  const { content } = useRendererContext();
  const text = props.text.trim() || content.displayName;

  return (
    <SectionContainer>
      <div
        className="flex flex-col items-center gap-3 border-t pt-6 text-center"
        style={{ borderColor: "var(--lc-border)" }}
      >
        {props.showSecureBadge && (
          <span
            className="inline-flex items-center gap-1.5 font-medium"
            style={{ color: "var(--lc-muted)", fontSize: bodySize(0.75) }}
          >
            <ShieldCheckIcon className="size-4" />
            Compra segura
          </span>
        )}

        <p style={{ color: "var(--lc-muted)", fontSize: bodySize(0.8) }}>{text}</p>

        {props.links.length > 0 && (
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {props.links.map((link) => (
              <FooterLink key={link.id} link={link} />
            ))}
          </ul>
        )}
      </div>
    </SectionContainer>
  );
}

function FooterLink({ link }: { link: FooterLinkItem }) {
  const selectable = useSelectableItem("links", link.id, link.label);

  return (
    <li className={cn("rounded-sm", selectable.className)}>
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2 transition-opacity hover:opacity-70"
        style={{ color: "var(--lc-muted)", fontSize: bodySize(0.78) }}
      >
        {link.label}
      </a>
      {selectable.overlay}
    </li>
  );
}
