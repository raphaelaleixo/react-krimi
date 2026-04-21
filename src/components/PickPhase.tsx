import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import CorkBoard from './board/CorkBoard';
import PlayerFolder from './board/PlayerFolder';
import WaitingNote from './board/WaitingNote';
import Pushpin from './board/Pushpin';
import StampButton from './board/StampButton';
import type { KrimiGameState } from '../types';

interface PickPhaseProps {
  gameState: KrimiGameState;
  playerId: number;
  playerOrderIndex: number;
}

export default function PickPhase({ gameState, playerId, playerOrderIndex }: PickPhaseProps) {
  const { submitPick } = useGame();
  const { t } = useI18n();

  const existingPick = gameState.playerPicks?.[playerOrderIndex];

  const [selectedMean, setSelectedMean] = useState<string | null>(
    existingPick?.mean ?? null,
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(
    existingPick?.key ?? null,
  );
  const [submitting, setSubmitting] = useState(false);

  const submitted = !!existingPick;

  const playerMeans = gameState.means.slice(
    playerOrderIndex * 4,
    playerOrderIndex * 4 + 4,
  );
  const playerClues = gameState.clues.slice(
    playerOrderIndex * 4,
    playerOrderIndex * 4 + 4,
  );

  const playerName = gameState.playerNames[playerId] || `Player ${playerId}`;

  const handleSubmit = async () => {
    if (!selectedMean || !selectedKey) return;
    setSubmitting(true);
    try {
      await submitPick(playerOrderIndex, { mean: selectedMean, key: selectedKey });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CorkBoard>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          px: 2,
          py: 5,
          width: '100%',
          maxWidth: 480,
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            bgcolor: '#f8f6f0',
            boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
            px: 3,
            py: 2.5,
          }}
        >
          <Pushpin color="#4a7c59" />
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '1rem',
              lineHeight: 1.4,
              color: 'var(--text-color)',
              textAlign: 'center',
            }}
          >
            {t('If you were the murderer, which cards would you want found at the scene?')}
          </Typography>
        </Box>

        <PlayerFolder
          playerName={playerName}
          means={playerMeans}
          clues={playerClues}
          mode={submitted ? 'display' : 'select'}
          selectedMean={selectedMean}
          selectedKey={selectedKey}
          onSelectMean={setSelectedMean}
          onSelectKey={setSelectedKey}
          stamp={submitted ? t('SUBMITTED') : null}
        />

        {submitted ? (
          <WaitingNote
            subtitle={t('Waiting for other players to submit their picks...')}
          />
        ) : (
          <StampButton
            onClick={handleSubmit}
            disabled={!selectedMean || !selectedKey || submitting}
          >
            {t('Submit pick')}
          </StampButton>
        )}
      </Box>
    </CorkBoard>
  );
}
