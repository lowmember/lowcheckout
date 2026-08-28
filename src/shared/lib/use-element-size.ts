import { useLayoutEffect, useRef, useState } from "react";

/**
 * Mede a largura real do container para desenhar SVG em pixels — necessário para
 * manter espessura de traço e tamanho de texto corretos, sem `preserveAspectRatio`.
 */
export function useElementSize<TElement extends HTMLElement>() {
  const ref = useRef<TElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    setWidth(element.clientWidth);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
