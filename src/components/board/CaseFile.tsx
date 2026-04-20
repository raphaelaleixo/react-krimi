import { useMemo } from 'react';
import Box from '@mui/material/Box';
import type { ReactNode, CSSProperties } from 'react';
import Pushpin from './Pushpin';

function generateTornEdge() {
  const points: string[] = ['0% 0%', '100% 0%'];
  const steps = 40;
  points.push('100% 95%');
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    const y = 95 + Math.random() * 3;
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  return `polygon(${points.join(', ')})`;
}

interface CaseFileProps {
  children: ReactNode;
  rotation?: number;
  maxWidth?: number;
  sx?: CSSProperties;
}

export default function CaseFile({
  children,
  rotation,
  maxWidth = 480,
}: CaseFileProps) {
  const tornEdge = useMemo(() => generateTornEdge(), []);
  const appliedRotation = useMemo(
    () => rotation ?? Math.random() * 5 - 2.5,
    [rotation],
  );

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth,
        mx: 'auto',
        my: 4,
        transform: `rotate(${appliedRotation}deg)`,
        '@media (prefers-reduced-motion: reduce)': { transform: 'none' },
      }}
    >
      <Pushpin color="#9E1B1B" />
      <Box
        sx={{
          bgcolor: '#f8f6f0',
          color: '#1C1B1B',
          px: { xs: 3, sm: 5 },
          pt: { xs: 3, sm: 5 },
          pb: { xs: 6, sm: 8 },
          boxShadow: '0 8px 24px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35)',
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 27px, #e8e4da 27px, #e8e4da 28px)',
          backgroundPosition: '0 48px',
          clipPath: tornEdge,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
