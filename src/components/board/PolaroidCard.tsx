import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';

function generateTornEdge() {
  const points: string[] = ['0% 0%', '100% 0%'];
  const steps = 30;
  // Right side down to bottom-right
  points.push('100% 95%');
  // Jagged bottom edge, right to left
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    const y = 95 + Math.random() * 3;
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  return `polygon(${points.join(', ')})`;
}

interface SuspectCardProps {
  name: string;
  means: string[];
  clues: string[];
  rotation: number;
  offsetY: number;
  stamp?: string;
  guessCount?: number;
}

export default function PolaroidCard({
  name,
  means,
  clues,
  rotation,
  offsetY,
  stamp,
  guessCount = 0,
}: SuspectCardProps) {
  const tornEdge = useMemo(() => generateTornEdge(), []);

  return (
    <Box
      sx={{
        position: 'relative',
        transform: `rotate(${rotation}deg)`,
        marginTop: `${offsetY}px`,
        transition: 'transform 0.3s ease-out',
      }}
    >
      <Pushpin />

      {/* Notebook page */}
      <Box
        sx={{
          bgcolor: '#f8f6f0',
          p: 2,
          boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
          position: 'relative',
          // Ruled lines
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 23px, #e8e4da 23px, #e8e4da 24px)',
          backgroundPosition: '0 36px',
          // Red margin line
          borderLeft: '2px solid rgba(220, 80, 80, 0.3)',
          // Torn bottom edge
          clipPath: tornEdge,
          pb: 4,
        }}
      >
        {/* Guess count */}
        {guessCount > 0 && (
          <Typography
            sx={{
              position: 'absolute',
              top: 8,
              right: 10,
              fontFamily: '"Permanent Marker", cursive',
              fontSize: '1.3rem',
              color: 'var(--evidence-color)',
            }}
          >
            {guessCount}x
          </Typography>
        )}

        {/* Player name at the top */}
        <Typography
          sx={{
            fontFamily: '"Permanent Marker", cursive',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            mb: 1.5,
            borderBottom: '1px solid #e8e4da',
            pb: 0.5,
          }}
        >
          {name}
        </Typography>

        <Typography
          sx={{
            fontFamily: '"Shadows Into Light", cursive',
            fontSize: '1.15rem',
            fontWeight: 'bold',
            color: 'var(--weapon-color)',
            lineHeight: 1.6,
          }}
        >
          {means.join(', ')}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Shadows Into Light", cursive',
            fontSize: '1.15rem',
            fontWeight: 'bold',
            color: 'var(--evidence-color)',
            lineHeight: 1.6,
          }}
        >
          {clues.join(', ')}
        </Typography>

        {/* Rubber stamp overlay */}
        {stamp && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-15deg)',
              zIndex: 2,
              border: '3px solid rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              px: 1.5,
              py: 0.5,
              pointerEvents: 'none',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"kingthings_trypewriter_2Rg", serif',
                fontSize: '1.4rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'rgba(0, 0, 0, 0.35)',
                letterSpacing: '2px',
                whiteSpace: 'nowrap',
              }}
            >
              {stamp}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
