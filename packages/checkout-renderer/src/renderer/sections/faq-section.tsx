import { cn } from "../../internal/cn";
import { ChevronDownIcon } from "../../internal/icons";
import type { FaqItem, FaqProps } from "../../types/checkout-schema";
import { Heading, SectionContainer, Surface, Text } from "../renderer-primitives";
import { useSelectableItem } from "../selectable-item";

interface FaqSectionProps {
  props: FaqProps;
}

/** `<details>` nativo: acessível por teclado e sem estado no renderer. */
export function FaqSection({ props }: FaqSectionProps) {
  return (
    <SectionContainer>
      <Surface className="overflow-hidden">
        {props.title.trim() && (
          <Heading size={1.1} className="px-4 pt-4">
            {props.title}
          </Heading>
        )}

        <div className="mt-3">
          {props.items.map((item, index) => (
            <FaqRow
              key={item.id}
              item={item}
              isFirst={index === 0}
              index={index}
              total={props.items.length}
            />
          ))}
        </div>
      </Surface>
    </SectionContainer>
  );
}

function FaqRow({
  item,
  isFirst,
  index,
  total,
}: {
  item: FaqItem;
  isFirst: boolean;
  index: number;
  total: number;
}) {
  // O toolbar fica à esquerda do chevron, dentro do summary — é a única área
  // do accordion fechado que continua no DOM para o overlay se prender.
  const selectable = useSelectableItem("items", item.id, item.question, {
    index,
    total,
    toolbarClassName: "top-1/2 right-9 -translate-y-1/2",
  });

  return (
    <details
      className={cn("group", selectable.className)}
      {...selectable.dragProps}
      style={{
        borderTopWidth: isFirst ? 0 : 1,
        borderTopStyle: "solid",
        borderTopColor: "var(--lc-border)",
        backgroundColor: "var(--lc-surface)",
      }}
    >
      {/* `relative` aqui, não só no `<details>`: com o acordeão aberto a altura
          do `<details>` inclui a resposta, e um toolbar centralizado por
          porcentagem flutuaria fora da pergunta. Preso ao summary, ele fica
          sempre alinhado à linha da pergunta, aberto ou fechado. */}
      <summary className="relative flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5">
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
        {selectable.toolbar}
      </summary>

      <div className="px-4 pb-4">
        <Text isMuted size={0.88}>
          {item.answer}
        </Text>
      </div>
    </details>
  );
}
