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

type AnnotationMark = 'cross' | 'circle';
type PlayerAnnotations = {
  means: Record<string, AnnotationMark>;
  clues: Record<string, AnnotationMark>;
};
type AnnotationsByPlayer = Record<number, PlayerAnnotations>;

const ANNOTATION_STORAGE_PREFIX = 'krimi:annotations';

function nextMark(current: AnnotationMark | undefined): AnnotationMark | undefined {
  if (current === undefined) return 'cross';
  if (current === 'cross') return 'circle';
  return undefined;
}

export default function Detective({ gameState, playerId, playerOrderIndex }: DetectiveProps) {
  const { passTurn, makeGuess, roomState } = useGame();
  const { t } = useI18n();
  const roomId = roomState?.roomId ?? null;
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

  const openSolveWithSuspect = (suspectOrderIndex: number) => {
    setGuess({ player: suspectOrderIndex, mean: null, key: null });
    setSolveSheet(true);
  };

  const storageKey = roomId ? `${ANNOTATION_STORAGE_PREFIX}:${roomId}:${playerId}` : null;
  const [annotations, setAnnotations] = useState<AnnotationsByPlayer>(() => {
    if (typeof window === 'undefined' || !storageKey) return {};
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as AnnotationsByPlayer) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !storageKey) return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(annotations));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [storageKey, annotations]);

  const cycleAnnotation = (
    targetOrderIndex: number,
    kind: 'means' | 'clues',
    value: string,
  ) => {
    setAnnotations((prev) => {
      const current = prev[targetOrderIndex] ?? { means: {}, clues: {} };
      const updated: Record<string, AnnotationMark> = { ...current[kind] };
      const next = nextMark(updated[value]);
      if (next === undefined) delete updated[value];
      else updated[value] = next;
      return {
        ...prev,
        [targetOrderIndex]: { ...current, [kind]: updated },
      };
    });
  };

  const slides = useMemo(() => {
    const selfSlide = {
      key: `self-${playerId}`,
      orderIndex: playerOrderIndex,
      name: gameState.playerNames[playerId] || `Player ${playerId}`,
      isSelf: true,
    };
    const otherSlides = otherPlayers.map((p) => ({
      key: `player-${p.id}`,
      orderIndex: p.index,
      name: p.name,
      isSelf: false,
    }));
    return [selfSlide, ...otherSlides];
  }, [otherPlayers, playerId, playerOrderIndex, gameState.playerNames]);

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

        <Box
          sx={{
            width: '100vw',
            mx: 'calc(-50vw + 50%)',
            overflowX: 'auto',
            overflowY: 'visible',
            scrollSnapType: 'x mandatory',
            display: 'flex',
            gap: 2,
            py: 2,
            px: 'max(16px, calc(50vw - 180px))',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {slides.map((slide) => {
            const suspectMeans = gameState.means.slice(
              slide.orderIndex * 4,
              slide.orderIndex * 4 + 4,
            );
            const suspectClues = gameState.clues.slice(
              slide.orderIndex * 4,
              slide.orderIndex * 4 + 4,
            );
            const slideAnnotations = annotations[slide.orderIndex] ?? { means: {}, clues: {} };
            const crossedMeans = Object.keys(slideAnnotations.means).filter(
              (k) => slideAnnotations.means[k] === 'cross',
            );
            const circledMeans = Object.keys(slideAnnotations.means).filter(
              (k) => slideAnnotations.means[k] === 'circle',
            );
            const crossedClues = Object.keys(slideAnnotations.clues).filter(
              (k) => slideAnnotations.clues[k] === 'cross',
            );
            const circledClues = Object.keys(slideAnnotations.clues).filter(
              (k) => slideAnnotations.clues[k] === 'circle',
            );
            const actionPhase = forensicReady && !ownGuess && !hasPassed;
            const footerNode = actionPhase
              ? slide.isSelf
                ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                        {t("That's you")}
                      </Typography>
                    </Box>
                  </Box>
                )
                : (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <StampButton
                      onClick={() => openSolveWithSuspect(slide.orderIndex)}
                      disabled={!!disableActions}
                    >
                      {t('Accuse')}
                    </StampButton>
                  </Box>
                )
              : undefined;

            return (
              <Box
                key={slide.key}
                sx={{
                  flex: '0 0 360px',
                  maxWidth: 360,
                  scrollSnapAlign: 'center',
                  scrollSnapStop: 'always',
                }}
              >
                <PlayerFolder
                  playerName={slide.name}
                  means={suspectMeans}
                  clues={suspectClues}
                  mode="display"
                  selectedMean={
                    slide.isSelf && isMurderer && gameState.murdererChoice
                      ? gameState.murdererChoice.mean
                      : null
                  }
                  selectedKey={
                    slide.isSelf && isMurderer && gameState.murdererChoice
                      ? gameState.murdererChoice.key
                      : null
                  }
                  crossedMeans={crossedMeans}
                  crossedClues={crossedClues}
                  circledMeans={circledMeans}
                  circledClues={circledClues}
                  onToggleMean={(m) => cycleAnnotation(slide.orderIndex, 'means', m)}
                  onToggleClue={(c) => cycleAnnotation(slide.orderIndex, 'clues', c)}
                  note={slide.isSelf ? statusNote : undefined}
                  footer={footerNode}
                />
              </Box>
            );
          })}
        </Box>

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
