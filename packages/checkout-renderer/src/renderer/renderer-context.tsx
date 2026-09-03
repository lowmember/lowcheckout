import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

import type { CheckoutFormController } from "../types/checkout-buyer";
import type { CheckoutContent } from "../types/checkout-content";

export type CheckoutViewport = "desktop" | "mobile";

/** Id do `<form>`: o botão de pagamento é outra seção e submete via `form=`. */
export const CHECKOUT_FORM_ID = "lc-checkout-form";

export type SelectionDirection = "up" | "down";

/**
 * Só o editor passa isto. Na página pública `selection` é `undefined` e nenhum
 * overlay de seleção chega ao DOM — o comprador recebe as seções puras.
 */
export interface CheckoutRendererSelection {
  selectedSectionId: string | null;
  selectedItemId: string | null;
  onSelectSection: (sectionId: string) => void;
  onSelectItem: (sectionId: string, fieldKey: string, itemId: string) => void;
  /** Ações do toolbar preso ao contorno azul — mover e remover sem passar pela lista de camadas. */
  onMoveSection: (sectionId: string, direction: SelectionDirection) => void;
  onRemoveSection: (sectionId: string) => void;
  onMoveItem: (
    sectionId: string,
    fieldKey: string,
    itemId: string,
    direction: SelectionDirection,
  ) => void;
  onRemoveItem: (sectionId: string, fieldKey: string, itemId: string) => void;
  /** Arrastar e soltar: reposiciona a seção/elemento arrastado no lugar do alvo. */
  onReorderSection: (sectionId: string, targetSectionId: string) => void;
  onReorderItem: (
    sectionId: string,
    fieldKey: string,
    itemId: string,
    targetItemId: string,
  ) => void;
}

interface RendererContextValue {
  content: CheckoutContent;
  viewport: CheckoutViewport;
  /** Ausente no preview do editor: os campos ficam inertes. */
  form?: CheckoutFormController;
  selection?: CheckoutRendererSelection;
}

const RendererContext = createContext<RendererContextValue | null>(null);

interface RendererProviderProps extends RendererContextValue {
  children: ReactNode;
}

export function RendererProvider({ children, ...value }: RendererProviderProps) {
  return <RendererContext.Provider value={value}>{children}</RendererContext.Provider>;
}

export function useRendererContext() {
  const value = useContext(RendererContext);

  if (!value) {
    throw new Error("useRendererContext precisa estar dentro de <CheckoutRenderer>.");
  }

  return value;
}

/**
 * Uma seção não recebe o próprio id — só os props. Este escopo entrega o id
 * para os elementos internos poderem se anunciar como selecionáveis, sem que
 * cada seção precise repassar prop nenhuma.
 */
const SectionScopeContext = createContext<string | null>(null);

interface SectionScopeProviderProps {
  sectionId: string;
  children: ReactNode;
}

export function SectionScopeProvider({ sectionId, children }: SectionScopeProviderProps) {
  return <SectionScopeContext.Provider value={sectionId}>{children}</SectionScopeContext.Provider>;
}

export function useSectionId() {
  return useContext(SectionScopeContext);
}

/**
 * Estado do arrastar-e-soltar de elementos (benefício, depoimento, pergunta,
 * link). É efêmero e não faz parte de `CheckoutRendererSelection` de
 * propósito — cada item mora numa seção diferente do componente que enumera
 * a lista dele, então precisa de um canal próprio para saber quem está sendo
 * arrastado e sobre qual elemento o mouse está agora.
 */
export interface DraggedItem {
  sectionId: string;
  fieldKey: string;
  itemId: string;
}

interface ItemDragContextValue {
  dragged: DraggedItem | null;
  dragOverItemId: string | null;
  setDragged: (item: DraggedItem | null) => void;
  setDragOverItemId: (itemId: string | null) => void;
}

const ItemDragContext = createContext<ItemDragContextValue | null>(null);

export function ItemDragProvider({ children }: { children: ReactNode }) {
  const [dragged, setDragged] = useState<DraggedItem | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  const value = useMemo(
    () => ({ dragged, dragOverItemId, setDragged, setDragOverItemId }),
    [dragged, dragOverItemId],
  );

  return <ItemDragContext.Provider value={value}>{children}</ItemDragContext.Provider>;
}

export function useItemDrag() {
  const value = useContext(ItemDragContext);

  if (!value) {
    throw new Error("useItemDrag precisa estar dentro de <CheckoutRenderer>.");
  }

  return value;
}
