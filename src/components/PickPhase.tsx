import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'motion/react';
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

  const folderFooter = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 72,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {submitted ? (
          <motion.div
            key="stamp"
            initial={{ scale: 1.8, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: -6, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          >
            <Box
              sx={{
                border: '3px solid rgba(0, 0, 0, 0.45)',
                borderRadius: '4px',
                px: 2,
                py: 0.5,
                display: 'inline-block',
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'var(--font-typewriter)',
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  color: 'rgba(0, 0, 0, 0.5)',
                  letterSpacing: '3px',
                  whiteSpace: 'nowrap',
                }}
              >
                {t('SUBMITTED')}
              </Typography>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <StampButton
              onClick={handleSubmit}
              disabled={!selectedMean || !selectedKey || submitting}
            >
              {t('Submit pick')}
            </StampButton>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );

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
        <PlayerFolder
          playerName={playerName}
          means={playerMeans}
          clues={playerClues}
          mode={submitted ? 'display' : 'select'}
          selectedMean={selectedMean}
          selectedKey={selectedKey}
          onSelectMean={setSelectedMean}
          onSelectKey={setSelectedKey}
          footer={folderFooter}
        />

        <Box
          sx={{
            width: '100%',
            minHeight: 120,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <WaitingNote
                  subtitle={t('Waiting for other players to submit their picks...')}
                />
              </motion.div>
            ) : (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: 320,
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
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </CorkBoard>
  );
}
