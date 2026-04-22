import type { ReactNode, Ref } from 'react';
import Box from '@mui/material/Box';
import CoffeeStains from './CoffeeStains';

interface CorkBoardProps {
  children: ReactNode;
  corkRef?: Ref<HTMLDivElement>;
}

export default function CorkBoard({ children, corkRef }: CorkBoardProps) {
  return (
    <Box
      ref={corkRef}
      sx={{
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      <CoffeeStains />
      {children}
    </Box>
  );
}
