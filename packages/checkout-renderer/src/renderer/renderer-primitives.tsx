import type { CSSProperties, ReactNode } from "react";

import { cn } from "../internal/cn";
import { StarIcon } from "../internal/icons";
import { bodySize, headingSize, spaceSize } from "../lib/checkout-theme";

/**
 * Peças visuais compartilhadas pelas seções. Nenhuma cor literal aqui: tudo sai
 * das custom properties do tema, então preview e página pública não divergem.
 */

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Ocupa a largura toda, sem a coluna central de leitura. */
  isBleed?: boolean;
}

/**
 * A coluna é estreita e as seções quase se encostam de propósito: empilhadas,
 * as superfícies brancas leem como um cartão só sobre o fundo da página — que é
 * o que faz um checkout parecer um formulário curto, e não uma landing page.
 */
export function SectionContainer({ children, className, style, isBleed }: SectionContainerProps) {
  return (
    <section
      className={cn("w-full", isBleed ? "px-0" : "px-3 @2xl:px-4", className)}
      style={{ paddingBlock: spaceSize(0.4), ...style }}
    >
      {isBleed ? children : <div className="mx-auto w-full max-w-[38rem]">{children}</div>}
    </section>
  );
}

interface SurfaceProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Surface({ children, className, style }: SurfaceProps) {
  return (
    <div
      className={cn("border", className)}
      style={{
        backgroundColor: "var(--lc-surface)",
        borderColor: "var(--lc-border)",
        borderRadius: "var(--lc-radius)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface HeadingProps {
  children: ReactNode;
  size?: number;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function Heading({ children, size = 1.5, className, as: Tag = "h2" }: HeadingProps) {
  return (
    <Tag
      className={cn("font-semibold leading-tight tracking-tight", className)}
      style={{ color: "var(--lc-text)", fontSize: headingSize(size) }}
    >
      {children}
    </Tag>
  );
}

interface TextProps {
  children: ReactNode;
  size?: number;
  isMuted?: boolean;
  className?: string;
}

export function Text({ children, size = 0.95, isMuted, className }: TextProps) {
  return (
    <p
      className={cn("leading-relaxed", className)}
      style={{ color: isMuted ? "var(--lc-muted)" : "var(--lc-text)", fontSize: bodySize(size) }}
    >
      {children}
    </p>
  );
}

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-medium uppercase tracking-wider",
        className,
      )}
      style={{
        color: "var(--lc-primary)",
        borderColor: "var(--lc-primary)",
        fontSize: bodySize(0.68),
      }}
    >
      {children}
    </span>
  );
}

interface StarRatingProps {
  rating: number;
}

export function StarRating({ rating }: StarRatingProps) {
  if (rating <= 0) return null;

  // As estrelas são decorativas e todas iguais; a nota é lida do rótulo do grupo.
  const stars = Array.from({ length: rating }, (_, position) => `star-${position + 1}`);

  return (
    <div role="img" className="flex items-center gap-0.5" aria-label={`Nota ${rating} de 5`}>
      {stars.map((star) => (
        <StarIcon
          key={star}
          className="size-3.5"
          style={{ color: "var(--lc-primary)", fill: "var(--lc-primary)" }}
        />
      ))}
    </div>
  );
}
