import { useMemo } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';
import { useI18n } from '../../hooks/useI18n';

function generateNameplateRotation() {
  return Math.random() * 3 - 1.5;
}

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

export type PolaroidRole = 'detective' | 'investigator';

interface PolaroidCardProps {
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
  role?: PolaroidRole;
  onToggleRole?: () => void;
}

const WEAPON_COLOR = 'var(--weapon-color)';
const EVIDENCE_COLOR = 'var(--evidence-color)';

export default function PolaroidCard({
  name,
  means,
  clues,
  rotation,
  offsetY,
  stamp,
  guessCount = 0,
  slotLabel,
  role,
  onToggleRole,
}: PolaroidCardProps) {
  const { t } = useI18n();
  const tornEdge = useMemo(() => generateTornEdge(), []);
  const nameplateRotation = useMemo(() => generateNameplateRotation(), []);

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
          sx={{
            fontFamily: 'var(--font-script)',
            fontSize: '1.7rem',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            lineHeight: 1,
            pr: 3,
            mb: 1.5,
          }}
        >
          {name}
        </Typography>

        {hasGameBody && (
          <>
            <Typography
              sx={{
                fontFamily: 'var(--font-typewriter)',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                color: WEAPON_COLOR,
                lineHeight: 1.6,
              }}
            >
              {means!.join(', ')}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'var(--font-typewriter)',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                color: EVIDENCE_COLOR,
                lineHeight: 1.6,
              }}
            >
              {clues!.join(', ')}
            </Typography>
          </>
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

      {/* Glued-on role nameplate (sibling — outside the torn-edge clip) */}
      {role && (
        <ButtonBase
          disableRipple
          onClick={onToggleRole}
          disabled={!onToggleRole}
          sx={{
            display: 'block',
            width: '90%',
            mx: 'auto',
            mt: -1,
            px: 2,
            py: 0.75,
            bgcolor: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            transform: `rotate(${nameplateRotation}deg)`,
            transition: 'transform 200ms ease, box-shadow 200ms ease',
            '&:hover': onToggleRole
              ? {
                  transform: `rotate(${nameplateRotation}deg) translateY(-2px)`,
                  boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                }
              : undefined,
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
              '&:hover': { transform: `rotate(${nameplateRotation}deg)` },
            },
          }}
        >
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              textAlign: 'center',
              color: role === 'detective' ? EVIDENCE_COLOR : WEAPON_COLOR,
              lineHeight: 1.2,
            }}
          >
            {role === 'detective' ? t('Forensic Scientist') : t('Investigator')}
          </Typography>
        </ButtonBase>
      )}
    </Box>
  );
}
