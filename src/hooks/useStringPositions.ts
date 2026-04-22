import { useLayoutEffect, useCallback, useState, type RefObject } from 'react';

export interface StringEndpoint {
  x: number;
  y: number;
}

export interface StringConnection {
  from: StringEndpoint;
  to: StringEndpoint;
}

export function useStringPositions(
  containerRef: RefObject<HTMLElement | null>,
  refs: Map<string, HTMLElement | null>,
  connections: Array<{ fromKey: string; toKey: string }>,
): StringConnection[] {
  const [positions, setPositions] = useState<StringConnection[]>([]);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const results: StringConnection[] = [];

    for (const { fromKey, toKey } of connections) {
      const fromEl = refs.get(fromKey);
      const toEl = refs.get(toKey);
      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      // From: right or left edge of guess note (whichever is closer to target)
      const fromCenterX = fromRect.left + fromRect.width / 2 - containerRect.left;
      const toCenterX = toRect.left + toRect.width / 2 - containerRect.left;

      const fromX = fromCenterX < toCenterX
        ? fromRect.right - containerRect.left
        : fromRect.left - containerRect.left;
      const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;

      // To: pushpin position (top center of target card)
      const toX = toCenterX;
      const toY = toRect.top - containerRect.top + 8; // pushpin offset

      results.push({ from: { x: fromX, y: fromY }, to: { x: toX, y: toY } });
    }

    setPositions(results);
  }, [containerRef, refs, connections]);

  useLayoutEffect(() => {
    // Measuring DOM layout on mount/resize requires syncing state
    // after the browser paints — setPositions in an effect is the
    // correct pattern here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    measure();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, measure]);

  return positions;
}
