import { useState, useCallback, useEffect, useRef } from 'react';

interface MasonryStyle {
  position: 'absolute';
  left: number;
  top: number;
}

export function useMasonryLayout(
  containerRef: React.RefObject<HTMLElement | null>,
  itemCount: number,
  columnWidth: number,
  gap: number,
) {
  const [styles, setStyles] = useState<MasonryStyle[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const setItemRef = useCallback((index: number, el: HTMLElement | null) => {
    itemRefs.current[index] = el;
  }, []);

  const recalculate = useCallback(() => {
    const container = containerRef.current;
    if (!container || itemCount === 0) return;

    const containerWidth = container.offsetWidth;
    const numColumns = Math.min(itemCount, Math.max(1, Math.floor((containerWidth + gap) / (columnWidth + gap))));
    const totalGridWidth = numColumns * columnWidth + (numColumns - 1) * gap;
    const offsetX = (containerWidth - totalGridWidth) / 2;
    const columnHeights = new Array(numColumns).fill(0);
    const newStyles: MasonryStyle[] = [];

    for (let i = 0; i < itemCount; i++) {
      // Assign to columns left-to-right, wrapping around
      const col = i % numColumns;

      const left = offsetX + col * (columnWidth + gap);
      const top = columnHeights[col];

      newStyles.push({ position: 'absolute', left, top });

      // Measure actual item height or estimate
      const item = itemRefs.current[i];
      const itemHeight = item ? item.offsetHeight : 200;
      columnHeights[col] = top + itemHeight + gap;
    }

    setStyles(newStyles);
    setContainerHeight(Math.max(...columnHeights));
  }, [containerRef, itemCount, columnWidth, gap]);

  useEffect(() => {
    // Recalculate after render so items are measured
    requestAnimationFrame(recalculate);

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => recalculate());
    observer.observe(container);
    return () => observer.disconnect();
  }, [recalculate]);

  return { styles, containerHeight, setItemRef };
}
