import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { RoomInfoModal, type RoomState } from 'react-gameroom';
import { DirectionalLink as RouterLink } from '../../router/DirectionalLink';
import { useI18n } from '../../hooks/useI18n';
import { generateDistressedCircle } from './distressedStamp';
import logo from '../../assets/logo.svg';
import type { KrimiGameState } from '../../types';

interface PlayerHeaderProps {
  roomState: RoomState;
  playerId: number;
  gameState: KrimiGameState | null;
}

export default function PlayerHeader({ roomState, playerId, gameState }: PlayerHeaderProps) {
  const { t } = useI18n();
  const [showInfo, setShowInfo] = useState(false);

  const stampClipPath = useMemo(() => generateDistressedCircle(), []);

  const seat =
    gameState && gameState.playerOrder.includes(playerId)
      ? gameState.playerOrder.indexOf(playerId) + 1
      : null;

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1,
        minHeight: 56,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <Box
        component={RouterLink}
        to="/"
        aria-label={t('Home')}
        sx={{ display: 'inline-flex', alignItems: 'center' }}
      >
        <Box
          component="img"
          src={logo}
          alt="Krimi"
          sx={{ height: 36, display: 'block' }}
        />
      </Box>

      <Box sx={{ flex: 1 }} />

      <Button
        variant="text"
        onClick={() => setShowInfo(true)}
        aria-label={`${t('Room')} ${roomState.roomId}`}
        sx={{
          fontFamily: 'var(--font-typewriter)',
          fontSize: '1rem',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#1C1B1B',
          whiteSpace: 'nowrap',
          minWidth: 0,
          px: 1.5,
          py: 0.5,
        }}
      >
        {t('Case')}#{roomState.roomId}
      </Button>

      {seat !== null && (
        <Box
          aria-label={`${t('Player')} ${seat}`}
          sx={{
            position: 'relative',
            width: 40,
            height: 40,
            border: '3px solid',
            borderColor: 'var(--weapon-color)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-5deg)',
            clipPath: stampClipPath,
            flexShrink: 0,
          }}
        >
          <Box
            component="span"
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: 'var(--weapon-color)',
              lineHeight: 1,
            }}
          >
            {seat}
          </Box>
        </Box>
      )}

      <RoomInfoModal
        roomState={roomState}
        open={showInfo}
        onClose={() => setShowInfo(false)}
        labels={{
          close: t('Close'),
          roomHeading: t('Room:'),
          joinLink: t('Join'),
          joinLinkAria: t('Join link for'),
          rejoinLink: t('Rejoin'),
          rejoinLinkAria: t('Rejoin link for'),
        }}
      />
    </Box>
  );
}
