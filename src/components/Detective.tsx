import { useState, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Container from '@mui/material/Container';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
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

      {/* Solve crime drawer — unchanged from previous implementation */}
      <SwipeableDrawer
        anchor="bottom"
        open={solveSheet}
        onClose={() => setSolveSheet(false)}
        onOpen={() => setSolveSheet(true)}
      >
        <Box sx={{ height: 500, textAlign: 'center', overflowY: 'auto' }}>
          <Container>
            <Button
              variant="contained"
              sx={{ mt: 6 }}
              onClick={() => setSolveSheet(false)}
            >
              {t('close')}
            </Button>
            <Typography variant="h5" sx={{ mt: 4 }}>
              {t('Solve the crime')}
            </Typography>
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography>{t('Who is the murderer?')}</Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>{t('Who is the murderer?')}</InputLabel>
                  <Select
                    value={guess.player ?? ''}
                    onChange={(e) =>
                      setGuess({ ...guess, player: e.target.value as number, mean: null, key: null })
                    }
                    label={t('Who is the murderer?')}
                  >
                    {otherPlayers.map((p) => (
                      <MenuItem key={p.id} value={p.index}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedPlayer && (
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left', mb: 1 }}>
                        {t('Select the means of murder:')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {gameState.means
                          .slice(selectedPlayer.index * 4, selectedPlayer.index * 4 + 4)
                          .map((mean) => (
                            <Chip
                              key={mean}
                              label={mean}
                              size="small"
                              icon={guess.mean === mean ? <CheckIcon /> : undefined}
                              onClick={() => setGuess({ ...guess, mean })}
                              sx={{
                                bgcolor: guess.mean === mean ? '#90caf9' : '#bbdefb',
                                opacity: 1,
                                cursor: 'pointer',
                              }}
                            />
                          ))}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left', mb: 1 }}>
                        {t('Select the key evidence:')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {gameState.clues
                          .slice(selectedPlayer.index * 4, selectedPlayer.index * 4 + 4)
                          .map((clue) => (
                            <Chip
                              key={clue}
                              label={clue}
                              size="small"
                              icon={guess.key === clue ? <CheckIcon /> : undefined}
                              onClick={() => setGuess({ ...guess, key: clue })}
                              sx={{
                                bgcolor: guess.key === clue ? '#ef9a9a' : '#ffcdd2',
                                opacity: 1,
                                cursor: 'pointer',
                              }}
                            />
                          ))}
                      </Box>
                    </Grid>
                  </Grid>
                )}

                <Box sx={{ mt: 3 }}>
                  <Button
                    onClick={handleSendGuess}
                    variant="contained"
                    disabled={!guess.player || !guess.mean || !guess.key}
                  >
                    {t('Send guess')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </SwipeableDrawer>
    </CorkBoard>
  );
}
