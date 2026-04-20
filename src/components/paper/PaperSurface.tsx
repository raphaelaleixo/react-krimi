import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

const NOISE_DATA_URI =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.08'/></svg>\")";

export default function PaperSurface({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100dvh',
        bgcolor: '#f5efe3',
        color: 'text.primary',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: NOISE_DATA_URI,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'multiply',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.12) 100%)',
        },
        '& > *': { position: 'relative', zIndex: 1 },
      }}
    >
      {children}
    </Box>
  );
}
