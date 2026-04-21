import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';
import { formatDisplayName } from '../../utils/formatDisplayName';

function generateTornEdge() {
  const points: string[] = ['0% 0%', '100% 0%'];
  const steps = 30;
  points.push('100% 95%');
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    const y = 95 + Math.random() * 3;
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  return `polygon(${points.join(', ')})`;
}

interface PlayerFileProps {
  name: string;
  rotation: number;
  offsetY: number;
  // game-only
  means?: string[];
  clues?: string[];
  stamp?: string;
  guessCount?: number;
  // lobby-only
  slotLabel?: string;
}

const WEAPON_COLOR = 'var(--weapon-color)';
const EVIDENCE_COLOR = 'var(--evidence-color)';

export default function PlayerFile({
  name,
  means,
  clues,
  rotation,
  offsetY,
  stamp,
  guessCount = 0,
  slotLabel,
}: PlayerFileProps) {
  const tornEdge = useMemo(() => generateTornEdge(), []);

  const hasGameBody = means !== undefined && clues !== undefined;
  const hasLobbyBody = slotLabel !== undefined;

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

      {/* Notebook page (clipped by torn edge) */}
      <Box
        sx={{
          background: `#f8f6f0 repeating-linear-gradient(transparent, transparent 23px, #e8e4da 23px, #e8e4da 24px) 0 36px`,
          p: 2,
          boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
          position: 'relative',
          borderLeft: '2px solid rgba(220, 80, 80, 0.3)',
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
              fontFamily: 'var(--font-script)',
              fontSize: '1.6rem',
              textTransform: 'uppercase',
              color: 'var(--evidence-color)',
            }}
          >
            {guessCount}x
          </Typography>
        )}

        {/* Name */}
        <Typography
          title={name}
          sx={{
            fontFamily: 'var(--font-script)',
            fontSize: '1.75em',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            lineHeight: 1,
            pr: 3,
            mb: 1.5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {formatDisplayName(name)}
        </Typography>

        {hasGameBody && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {means!.map((m, i) => (
              <Typography
                key={`m-${i}`}
                sx={{
                  fontFamily: 'var(--font-typewriter)',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  color: 'var(--text-color)',
                  lineHeight: 1.4,
                  px: 0.5,
                  background: `linear-gradient(color-mix(in srgb, ${WEAPON_COLOR} 20%, transparent), color-mix(in srgb, ${WEAPON_COLOR} 20%, transparent)) no-repeat`,
                  backgroundSize: '100% 85%',
                  backgroundPosition: '0 60%',
                }}
              >
                {m}
              </Typography>
            ))}
            {clues!.map((c, i) => (
              <Typography
                key={`c-${i}`}
                sx={{
                  fontFamily: 'var(--font-typewriter)',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  color: 'var(--text-color)',
                  lineHeight: 1.4,
                  px: 0.5,
                  background: `linear-gradient(color-mix(in srgb, ${EVIDENCE_COLOR} 20%, transparent), color-mix(in srgb, ${EVIDENCE_COLOR} 20%, transparent)) no-repeat`,
                  backgroundSize: '100% 85%',
                  backgroundPosition: '0 60%',
                }}
              >
                {c}
              </Typography>
            ))}
          </Box>
        )}

        {hasLobbyBody && !hasGameBody && (
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'var(--text-color)',
              lineHeight: 1.6,
            }}
          >
            {slotLabel}
          </Typography>
        )}

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
                fontFamily: 'var(--font-typewriter)',
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
