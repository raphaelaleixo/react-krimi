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
        '--text-color': '#1C1B1B',
        '--weapon-color': '#3A7085',
        '--evidence-color': '#9E1B1B',
      }}
    >
      <CoffeeStains />
      {children}
    </Box>
  );
}
