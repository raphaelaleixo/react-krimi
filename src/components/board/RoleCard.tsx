import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';
import { useI18n } from '../../hooks/useI18n';
import { formatDisplayName } from '../../utils/formatDisplayName';

export interface RoleCardProps {
  playerName: string;
  role: 'detective' | 'murderer';
  width?: number | string;
}

export default function RoleCard({ playerName, role, width = 260 }: RoleCardProps) {
  const { t } = useI18n();
  const isMurderer = role === 'murderer';

  return (
    <Box
      className="krimi-anim-pinned"
      sx={{
        position: 'relative',
        width,
        mx: 'auto',
        bgcolor: '#f5efe0',
        boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
        px: 3,
        py: 2.5,
        border: '1px solid rgba(0,0,0,0.1)',
        transform: 'rotate(-2deg)',
      }}
    >
      <Pushpin color={isMurderer ? 'var(--evidence-color)' : '#3a4b5c'} />

      {isMurderer && (
        <>
          <svg
            aria-hidden
            viewBox="0 0 100 80"
            style={{
              position: 'absolute',
              top: -14,
              right: -18,
              width: 80,
              height: 65,
              pointerEvents: 'none',
              opacity: 0.7,
            }}
          >
            <g fill="#7a1010">
              <path d="M30,42 Q18,30 25,18 Q38,5 55,12 Q72,20 78,34 Q82,50 70,58 Q56,68 42,62 Q28,58 30,42 Z" />
              <circle cx="88" cy="22" r="3" />
              <circle cx="93" cy="30" r="1.6" />
              <ellipse cx="20" cy="68" rx="3.5" ry="2.5" />
              <circle cx="10" cy="52" r="1.8" />
              <path d="M50,66 Q52,74 50,80 Q48,74 50,66 Z" />
            </g>
          </svg>
          <svg
            aria-hidden
            viewBox="0 0 60 50"
            style={{
              position: 'absolute',
              bottom: -10,
              left: -8,
              width: 55,
              height: 42,
              pointerEvents: 'none',
              opacity: 0.55,
            }}
          >
            <g fill="#6a1010">
              <path d="M22,26 Q12,18 22,10 Q34,8 40,20 Q44,32 30,36 Q18,38 22,26 Z" />
              <circle cx="50" cy="42" r="2" />
              <circle cx="8" cy="40" r="1.5" />
              <ellipse cx="47" cy="10" rx="2" ry="1.4" />
            </g>
          </svg>
        </>
      )}

      <Typography
        title={playerName}
        sx={{
          fontFamily: 'var(--font-script)',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'var(--text-color)',
          lineHeight: 1,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {formatDisplayName(playerName)}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontFamily: 'var(--font-typewriter)',
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textAlign: 'center',
          color: isMurderer ? 'var(--evidence-color)' : 'var(--text-color)',
        }}
      >
        {isMurderer ? t('The Murderer') : t('Investigator')}
      </Typography>
    </Box>
  );
}
