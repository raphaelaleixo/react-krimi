import type { ReactNode, Ref } from 'react';
import Box from '@mui/material/Box';
import CoffeeStains from './CoffeeStains';

interface CorkBoardProps {
  children: ReactNode;
  corkRef?: Ref<HTMLDivElement>;
}

export default function CorkBoard({ children, corkRef }: CorkBoardProps) {
  return (
    // Wall — dark precinct wall behind the board
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#2a2d32',
        overflow: 'hidden',
      }}
    >
      {/* Frame — wooden border */}
      <Box
        sx={{
          width: '95vw',
          height: '90vh',
          borderRadius: '4px',
          border: '12px solid',
          borderImage: 'linear-gradient(135deg, #8B6914 0%, #A0782C 25%, #6B4F12 50%, #9C7A38 75%, #7A5C1E 100%) 1',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(0,0,0,0.2)',
        }}
      >
        {/* Cork surface */}
        <Box
          ref={corkRef}
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            // Cork texture via CSS — repeating warm brown pattern
            backgroundColor: '#c19a6b',
            backgroundImage: `
              radial-gradient(ellipse at 20% 50%, rgba(160, 120, 60, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 30%, rgba(180, 140, 80, 0.2) 0%, transparent 40%),
              radial-gradient(circle at 50% 80%, rgba(140, 100, 50, 0.25) 0%, transparent 45%),
              url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")
            `,
          }}
        >
          <CoffeeStains />
          {children}
        </Box>
      </Box>
    </Box>
  );
}
