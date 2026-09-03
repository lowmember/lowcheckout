import { cn } from "../../internal/cn";
import { ShieldCheckIcon } from "../../internal/icons";
import { bodySize, spaceSize } from "../../lib/checkout-theme";
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
    <SectionContainer style={{ paddingBlock: spaceSize(1.5) }}>
      <div className="flex flex-col items-center gap-2 text-center">
        {props.showSecureBadge && (
          <span
            className="inline-flex items-center gap-1.5 font-medium"
            style={{ color: "var(--lc-muted)", fontSize: bodySize(0.72) }}
          >
            <ShieldCheckIcon className="size-3.5" />
            Compra segura
          </span>
        )}

        <p style={{ color: "var(--lc-muted)", fontSize: bodySize(0.74) }}>
          {text} · Todos os direitos reservados
        </p>

        {content.contactEmail && (
          <a
            href={`mailto:${content.contactEmail}`}
            className="underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: "var(--lc-muted)", fontSize: bodySize(0.72) }}
          >
            {content.contactEmail}
          </a>
        )}

        {props.links.length > 0 && (
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {props.links.map((link, index) => (
              <FooterLink key={link.id} link={link} index={index} total={props.links.length} />
            ))}
          </ul>
        )}
      </div>
    </SectionContainer>
  );
}

function FooterLink({
  link,
  index,
  total,
}: {
  link: FooterLinkItem;
  index: number;
  total: number;
}) {
  // Links são curtos: o toolbar flutua acima em vez de tentar caber no canto do próprio link.
  const selectable = useSelectableItem("links", link.id, link.label, {
    index,
    total,
    toolbarClassName: "-top-8 left-1/2 -translate-x-1/2",
  });

  return (
    <li className={cn("rounded-sm", selectable.className)}>
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2 transition-opacity hover:opacity-70"
        style={{ color: "var(--lc-muted)", fontSize: bodySize(0.72) }}
      >
        {link.label}
      </a>
      {selectable.overlay}
      {selectable.toolbar}
    </li>
  );
}
