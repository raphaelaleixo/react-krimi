import { type ReactNode, type Ref, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import CorkBoard from './CorkBoard';
import { useMasonryLayout } from '../../hooks/useMasonryLayout';
import logo from '../../assets/logo-wordmark.svg';

interface CaseBoardLayoutProps<T> {
  leftPanel: ReactNode;
  items: T[];
  getItemKey: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  belowGrid?: ReactNode;
  corkRef?: Ref<HTMLDivElement>;
  animateItems?: boolean;
  columnWidth?: number;
  gap?: number;
}

export default function CaseBoardLayout<T>({
  leftPanel,
  items,
  getItemKey,
  renderItem,
  belowGrid,
  corkRef,
  animateItems = false,
  columnWidth = 220,
  gap = 24,
}: CaseBoardLayoutProps<T>) {
  const masonryRef = useRef<HTMLDivElement>(null);
  const masonry = useMasonryLayout(masonryRef, items.length, columnWidth, gap);

  // Masonry is "ready" when every current item has a measured position.
  const ready =
    masonry.styles.length === items.length &&
    items.every((_, i) => masonry.styles[i] !== undefined);

  // Position transitions (smooth slide on reorder) are only safe once the
  // first paint has landed at measured positions — otherwise the (0,0)
  // placeholder would animate into place.
  const [positionsAnimated, setPositionsAnimated] = useState(false);
  useEffect(() => {
    if (!ready || positionsAnimated) return;
    const t = window.setTimeout(() => setPositionsAnimated(true), 500);
    return () => window.clearTimeout(t);
  }, [ready, positionsAnimated]);

  // Stagger index for initial entrance when animateItems is true.
  const [hasMountedOnce, setHasMountedOnce] = useState(false);
  if (ready && !hasMountedOnce) {
    setHasMountedOnce(true);
  }

  const cards = items.map((item, i) => {
    const style = masonry.styles[i];
    const key = getItemKey(item, i);
    const refCallback = (el: HTMLDivElement | null) => masonry.setItemRef(i, el);

    if (!ready) {
      return (
        <div
          key={key}
          ref={refCallback}
          style={{
            position: 'absolute',
            width: columnWidth,
            left: 0,
            top: 0,
            visibility: 'hidden',
          }}
        >
          {renderItem(item, i)}
        </div>
      );
    }

    const isInitialBatch = !hasMountedOnce;
    const animClass = animateItems ? 'krimi-anim-pinned' : '';
    const animationDelay = animateItems && isInitialBatch ? `${i * 60}ms` : undefined;

    return (
      <div
        key={key}
        ref={refCallback}
        className={animClass}
        style={{
          position: 'absolute',
          width: columnWidth,
          left: style!.left,
          top: style!.top,
          transition: positionsAnimated
            ? 'left 320ms cubic-bezier(0.4, 0, 0.2, 1), top 320ms cubic-bezier(0.4, 0, 0.2, 1)'
            : undefined,
          animationDelay,
        }}
      >
        {renderItem(item, i)}
      </div>
    );
  });

  return (
    <CorkBoard corkRef={corkRef}>
      <Box
        component="img"
        src={logo}
        alt="Krimi"
        sx={{
          position: 'absolute',
          top: 24,
          right: 24,
          height: 40,
          display: 'block',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      <Box sx={{ display: 'flex', p: 3, gap: 3, minHeight: '100vh' }}>
        <Box>{leftPanel}</Box>
        <Box
          sx={{
            flex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            ref={masonryRef}
            style={{
              position: 'relative',
              width: '100%',
              height: masonry.containerHeight,
              transition: 'height 320ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {cards}
          </div>
          {belowGrid}
        </Box>
      </Box>
    </CorkBoard>
  );
}
