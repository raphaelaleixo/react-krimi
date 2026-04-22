import { type ReactNode, type Ref, useRef } from 'react';
import Box from '@mui/material/Box';
import { motion, AnimatePresence } from 'motion/react';
import CorkBoard from './CorkBoard';
import { useMasonryLayout } from '../../hooks/useMasonryLayout';

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

  const cards = items.map((item, i) => {
    const style = masonry.styles[i];
    const key = getItemKey(item, i);
    const baseStyle = {
      width: columnWidth,
      position: 'absolute' as const,
      left: style?.left ?? 0,
      top: style?.top ?? 0,
    };
    const refCallback = (el: HTMLDivElement | null) => masonry.setItemRef(i, el);

    if (animateItems) {
      return (
        <motion.div
          key={key}
          layout
          initial={{ opacity: 0, scale: 0.7, y: -40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
            layout: { type: 'spring', stiffness: 300, damping: 30 },
          }}
          ref={refCallback}
          style={baseStyle}
        >
          {renderItem(item, i)}
        </motion.div>
      );
    }

    return (
      <motion.div
        key={key}
        layout
        transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }}
        ref={refCallback}
        style={baseStyle}
      >
        {renderItem(item, i)}
      </motion.div>
    );
  });

  return (
    <CorkBoard corkRef={corkRef}>
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
          <motion.div
            ref={masonryRef}
            animate={{ height: masonry.containerHeight }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ position: 'relative', width: '100%' }}
          >
            {animateItems ? <AnimatePresence>{cards}</AnimatePresence> : cards}
          </motion.div>
          {belowGrid}
        </Box>
      </Box>
    </CorkBoard>
  );
}
