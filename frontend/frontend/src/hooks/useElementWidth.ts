import { useCallback, useRef, useState } from 'react';

/** Tracks an element's content width; the callback ref follows remounts. */
export function useElementWidth<T extends HTMLElement>(fallback = 640) {
  const [width, setWidth] = useState(fallback);
  const observer = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!node) return;
    setWidth(node.getBoundingClientRect().width);
    observer.current = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.current.observe(node);
  }, []);

  return { ref, width };
}
