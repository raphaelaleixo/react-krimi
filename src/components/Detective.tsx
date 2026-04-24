import { useState, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import CorkBoard from './board/CorkBoard';
import RoleCard from './board/RoleCard';
import PlayerFolder from './board/PlayerFolder';
import PassNote from './board/PassNote';
import GuessNote from './board/GuessNote';
import StampButton from './board/StampButton';
import TapedNoteButton from './board/TapedNoteButton';
import WaitingNote from './board/WaitingNote';
import GuessUnlockedStamp from './board/GuessUnlockedStamp';
import { SheetFrame, SlotRow } from './board/forensicSheetParts';
import type { KrimiGameState } from '../types';
import { isForensicReady } from '../utils/rules';

interface DetectiveProps {
  gameState: KrimiGameState;
  playerId: number;
  playerOrderIndex: number;
}

export default function Detective({ gameState, playerId, playerOrderIndex }: DetectiveProps) {
  const { passTurn, makeGuess } = useGame();
  const { t } = useI18n();
  const [solveSheet, setSolveSheet] = useState(false);
  const [guess, setGuess] = useState<{ player: number | null; mean: string | null; key: string | null }>({
    player: null,
    mean: null,
    key: null,
  });

  const isMurderer = playerOrderIndex === gameState.murderer;

  const disableActions = useMemo(() => {
    return (
      (gameState.passedTurns && gameState.passedTurns[playerOrderIndex]) ||
      (gameState.guesses && !!gameState.guesses[playerOrderIndex])
    );
  }, [gameState.passedTurns, gameState.guesses, playerOrderIndex]);

  const hasPassed = !!(gameState.passedTurns && gameState.passedTurns[playerOrderIndex]);

  const ownGuess = useMemo(() => {
    const g = gameState.guesses?.[playerOrderIndex];
    if (!g || typeof g !== 'object') return null;
    const accusedPid = gameState.playerOrder[g.player];
    const accusedName = gameState.playerNames[accusedPid];
    const isWrong =
      gameState.finished &&
      !(
        gameState.murdererChoice &&
        g.mean === gameState.murdererChoice.mean &&
        g.key === gameState.murdererChoice.key
      );
    return { accusedName, mean: g.mean, evidenceKey: g.key, isWrong };
  }, [gameState, playerOrderIndex]);

  const statusNote = hasPassed ? (
    <PassNote rotation={2} fullWidth />
  ) : ownGuess ? (
    <GuessNote
      accusedName={ownGuess.accusedName}
      mean={ownGuess.mean}
      evidenceKey={ownGuess.evidenceKey}
      isWrong={ownGuess.isWrong}
      rotation={2}
      fullWidth
    />
  ) : null;

  const forensicReady = isForensicReady(gameState);
  const [lastSeenForensicReady, setLastSeenForensicReady] = useState(forensicReady);
  const [showGuessStamp, setShowGuessStamp] = useState(false);

  if (forensicReady !== lastSeenForensicReady) {
    setLastSeenForensicReady(forensicReady);
    if (forensicReady && !lastSeenForensicReady) {
      setShowGuessStamp(true);
    }
  }

  useEffect(() => {
    if (!showGuessStamp) return;
    const timer = window.setTimeout(() => setShowGuessStamp(false), 1400);
    return () => window.clearTimeout(timer);
  }, [showGuessStamp]);

  // Other players (excluding detective and self) for guessing
  const otherPlayers = useMemo(() => {
    return gameState.playerOrder
      .map((pid, idx) => ({ id: pid, index: idx, name: gameState.playerNames[pid] }))
      .filter((p) => p.index !== gameState.detective && p.index !== playerOrderIndex);
  }, [gameState, playerOrderIndex]);

  const selectedPlayer = useMemo(() => {
    if (guess.player === null) return null;
    return otherPlayers.find((p) => p.index === guess.player) || null;
  }, [guess.player, otherPlayers]);

  const playerMeans = gameState.means.slice(playerOrderIndex * 4, playerOrderIndex * 4 + 4);
  const playerClues = gameState.clues.slice(playerOrderIndex * 4, playerOrderIndex * 4 + 4);

  const handlePassTurn = async () => {
    await passTurn(playerOrderIndex);
  };

  const handleSendGuess = async () => {
    if (guess.player === null || !guess.mean || !guess.key) return;
    await makeGuess(playerOrderIndex, {
      player: guess.player,
      mean: guess.mean,
      key: guess.key,
    });
    setSolveSheet(false);
  };

  const playerName = gameState.playerNames[playerId] || `Player ${playerId}`;

  return (
    <CorkBoard>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          px: 2,
          py: 4,
          width: '100%',
          maxWidth: 480,
          mx: 'auto',
        }}
      >
        <RoleCard
          playerName={playerName}
          role={isMurderer ? 'murderer' : 'detective'}
          width="100%"
        />

        {showGuessStamp && (
          <GuessUnlockedStamp label={t('You may now guess')} />
        )}

        <PlayerFolder
          playerName={playerName}
          means={playerMeans}
          clues={playerClues}
          mode="display"
          selectedMean={isMurderer && gameState.murdererChoice ? gameState.murdererChoice.mean : null}
          selectedKey={isMurderer && gameState.murdererChoice ? gameState.murdererChoice.key : null}
          hideTab
          note={statusNote}
          footer={
            forensicReady && !ownGuess ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <StampButton
                  onClick={() => setSolveSheet(true)}
                  disabled={!!disableActions}
                >
                  {t('Accuse')}
                </StampButton>
              </Box>
            ) : undefined
          }
        />

        {!forensicReady ? (
          <WaitingNote
            subtitle={t('Waiting for the Forensic Scientist...')}
          />
        ) : !ownGuess && !hasPassed ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: -2 }}>
            <TapedNoteButton
              rotation={-2}
              onClick={handlePassTurn}
              disabled={!!disableActions}
            >
              {t('Pass turn')}
            </TapedNoteButton>
          </Box>
        ) : null}
      </Box>

      <SwipeableDrawer
        anchor="bottom"
        open={solveSheet}
        onClose={() => setSolveSheet(false)}
        onOpen={() => setSolveSheet(true)}
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              maxHeight: '92dvh',
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            pt: 3,
            pb: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            overflowY: 'auto',
          }}
        >
          <SheetFrame width="100%">
            <Typography
              sx={{
                fontFamily: 'var(--font-typewriter)',
                fontSize: '1.75rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--text-color)',
                textAlign: 'center',
                mb: 0.75,
              }}
            >
              {t('Submit your accusation')}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'var(--font-typewriter)',
                fontSize: '1rem',
                fontStyle: 'italic',
                letterSpacing: '0.5px',
                color: '#5f6c7b',
                textAlign: 'center',
                mb: 3,
                px: 2,
              }}
            >
              {t('You only get one accusation the whole game — make it count.')}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                width: '100%',
                maxWidth: 300,
                mx: 'auto',
              }}
            >
              <SlotRow
                index={0}
                title={t('Murderer')}
                value={selectedPlayer?.name ?? ''}
                options={otherPlayers.map((p) => p.name)}
                onChange={(name) => {
                  const match = otherPlayers.find((p) => p.name === name);
                  setGuess({ player: match?.index ?? null, mean: null, key: null });
                }}
              />
              <Box
                sx={{
                  opacity: selectedPlayer ? 1 : 0,
                  transition: 'opacity 300ms ease',
                }}
              >
                <SlotRow
                  index={1}
                  title={t('Means')}
                  value={guess.mean ?? ''}
                  options={
                    selectedPlayer
                      ? gameState.means.slice(
                          selectedPlayer.index * 4,
                          selectedPlayer.index * 4 + 4,
                        )
                      : []
                  }
                  onChange={(mean) => setGuess({ ...guess, mean })}
                  disabled={!selectedPlayer}
                />
              </Box>
              <Box
                sx={{
                  opacity: selectedPlayer ? 1 : 0,
                  transition: 'opacity 300ms ease',
                }}
              >
                <SlotRow
                  index={2}
                  title={t('Key evidence')}
                  value={guess.key ?? ''}
                  options={
                    selectedPlayer
                      ? gameState.clues.slice(
                          selectedPlayer.index * 4,
                          selectedPlayer.index * 4 + 4,
                        )
                      : []
                  }
                  onChange={(key) => setGuess({ ...guess, key })}
                  disabled={!selectedPlayer}
                />
              </Box>
            </Box>

            <Box
              sx={{
                mt: 4,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <StampButton variant="text" onClick={() => setSolveSheet(false)}>
                {t('close')}
              </StampButton>
              <StampButton
                onClick={handleSendGuess}
                disabled={guess.player === null || !guess.mean || !guess.key}
              >
                {t('Send guess')}
              </StampButton>
            </Box>
          </SheetFrame>
        </Box>
      </SwipeableDrawer>
    </CorkBoard>
  );
}
