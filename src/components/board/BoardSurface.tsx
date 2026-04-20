import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import CoffeeStains from './CoffeeStains';

const CORK_TEXTURE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3' stitchTiles='stitch' seed='7'/><feColorMatrix type='matrix' values='0 0 0 0.55 0.38  0 0 0 0.38 0.25  0 0 0 0.22 0.14  0 0 0 1.4 -0.15'/></filter><rect width='100%' height='100%' filter='url(%23c)'/></svg>\")";

export default function BoardSurface({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100dvh',
        bgcolor: '#0A0A0B',
        backgroundImage: CORK_TEXTURE,
        backgroundRepeat: 'repeat',
        backgroundSize: '240px 240px',
        color: '#f5efe3',
        overflow: 'hidden',
      }}
    >
      <CoffeeStains />
      <Box sx={{ position: 'relative', zIndex: 1 }}>{children}</Box>
    </Box>
  );
}
