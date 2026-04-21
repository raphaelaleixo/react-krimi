import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';
import { formatDisplayName } from '../../utils/formatDisplayName';

function generateTornEdge() {
  const points: string[] = ['0% 0%', '100% 0%'];
  const steps = 30;
  points.push('100% 97%');
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    const y = 97 + Math.random() * 2;
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  return `polygon(${points.join(', ')})`;
}

export interface PlayerFolderProps {
  playerName: string;
  means: string[];
  clues: string[];
  mode: 'select' | 'display';
  selectedMean?: string | null;
  selectedKey?: string | null;
  onSelectMean?: (mean: string) => void;
  onSelectKey?: (key: string) => void;
  stamp?: string | null;
}

const WEAPON_COLOR = 'var(--weapon-color)';
const EVIDENCE_COLOR = 'var(--evidence-color)';

export default function PlayerFolder({
  playerName,
  means,
  clues,
  mode,
  selectedMean,
  selectedKey,
  onSelectMean,
  onSelectKey,
  stamp,
}: PlayerFolderProps) {
  const tornEdge = useMemo(() => generateTornEdge(), []);
  const isSelect = mode === 'select';

  const renderLine = (
    text: string,
    kind: 'mean' | 'clue',
    isSelected: boolean,
  ) => {
    const color = kind === 'mean' ? WEAPON_COLOR : EVIDENCE_COLOR;
    const handleClick = () => {
      if (kind === 'mean') onSelectMean?.(text);
      else onSelectKey?.(text);
    };
    const interactiveProps = isSelect
      ? {
          component: 'button' as const,
          type: 'button' as const,
          onClick: handleClick,
          disabled: false,
        }
      : {
          component: 'div' as const,
        };
    return (
      <Box
        key={`${kind}-${text}`}
        {...interactiveProps}
        sx={{
          position: 'relative',
          display: 'inline-block',
          alignSelf: 'flex-start',
          border: 'none',
          background: 'transparent',
          p: 0,
          m: 0,
          mb: 0.5,
          cursor: isSelect ? 'pointer' : 'default',
          font: 'inherit',
          textAlign: 'left',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-typewriter)',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            lineHeight: 1.4,
            px: 0.5,
            background: `linear-gradient(color-mix(in srgb, ${color} 20%, transparent), color-mix(in srgb, ${color} 20%, transparent)) no-repeat`,
            backgroundSize: '100% 85%',
            backgroundPosition: '0 60%',
          }}
        >
          {text}
        </Typography>
        {isSelected && (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: '-15%',
              left: '-8%',
              width: '116%',
              height: '130%',
              pointerEvents: 'none',
              border: '2.5px solid var(--evidence-color)',
              borderRadius: '55% 45% 52% 48% / 60% 40% 60% 40%',
              transform: 'rotate(-2deg)',
              opacity: 0.85,
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 360, mx: 'auto' }}>
      <Pushpin />
      <Box
        sx={{
          background: `#f8f6f0 repeating-linear-gradient(transparent, transparent 23px, #e8e4da 23px, #e8e4da 24px) 0 36px`,
          px: 2.5,
          pt: 2,
          pb: 4,
          boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
          position: 'relative',
          borderLeft: '2px solid rgba(220, 80, 80, 0.3)',
          clipPath: tornEdge,
        }}
      >
        <Typography
          title={playerName}
          sx={{
            fontFamily: 'var(--font-script)',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            lineHeight: 1,
            mb: 1.5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {formatDisplayName(playerName)}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {means.map((m) => renderLine(m, 'mean', selectedMean === m))}
          {clues.map((c) => renderLine(c, 'clue', selectedKey === c))}
        </Box>

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
