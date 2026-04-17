import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useGame } from '../contexts/GameContext';
import CorkBoard from './board/CorkBoard';
import PolaroidCard from './board/PolaroidCard';
import ForensicSheet from './board/ForensicSheet';
import GuessNote from './board/GuessNote';
import RedStrings from './board/RedStrings';
import Pushpin from './board/Pushpin';
import { useI18n } from '../hooks/useI18n';
import { useStringPositions } from '../hooks/useStringPositions';

function randomRotation() {
  return parseInt(String(3 - Math.random() * 6));
}

export default function Board() {
  const { gameState } = useGame();
  const { t } = useI18n();

  // Memoize random rotations so they don't change on re-render
  const cardRotations = useMemo(() => {
    if (!gameState) return {};
    const rotations: Record<number, { card: number; stamp: number }> = {};
    gameState.playerOrder.forEach((pid) => {
      rotations[pid] = { card: randomRotation(), stamp: randomRotation() };
    });
    return rotations;
  }, [gameState?.playerOrder]);

  const cardOffsets = useMemo(() => {
    if (!gameState) return {};
    const offsets: Record<number, number> = {};
    gameState.playerOrder.forEach((pid) => {
      offsets[pid] = Math.floor(Math.random() * 20) - 10;
    });
    return offsets;
  }, [gameState?.playerOrder]);

  const corkRef = useRef<HTMLDivElement>(null);
  const elementRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  const [corkSize, setCorkSize] = useState({ width: 0, height: 0 });

  const setElementRef = useCallback((key: string, el: HTMLElement | null) => {
    elementRefs.current.set(key, el);
  }, []);

  // Measure cork surface for SVG dimensions
  useEffect(() => {
    if (!corkRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setCorkSize({ width, height });
    });
    observer.observe(corkRef.current);
    return () => observer.disconnect();
  }, []);

  if (!gameState) return null;

  const suspects = gameState.playerOrder
    .map((pid, idx) => ({ id: pid, index: idx, name: gameState.playerNames[pid] }))
    .filter((p) => p.index !== gameState.detective);

  const detectiveName =
    gameState.playerNames[gameState.playerOrder[gameState.detective]] || 'Detective';

  const guessData = useMemo(() => {
    if (!gameState?.guesses) return [];
    return gameState.guesses
      .map((guess, playerIndex) => {
        if (!guess || typeof guess !== 'object') return null;
        const accuserName = gameState.playerNames[gameState.playerOrder[playerIndex]];
        const accusedPid = gameState.playerOrder[guess.player];
        const accusedName = gameState.playerNames[accusedPid];
        const isWrong = gameState.finished && !(
          gameState.murdererChoice &&
          guess.mean === gameState.murdererChoice.mean &&
          guess.key === gameState.murdererChoice.key
        );
        return {
          playerIndex,
          accuserName,
          accusedName,
          accusedPid,
          mean: guess.mean,
          evidenceKey: guess.key,
          isWrong,
        };
      })
      .filter(Boolean) as Array<{
        playerIndex: number;
        accuserName: string;
        accusedName: string;
        accusedPid: number;
        mean: string;
        evidenceKey: string;
        isWrong: boolean;
      }>;
  }, [gameState]);

  const stringConnections = useMemo(() => {
    return guessData.map((g) => ({
      fromKey: `guess-${g.playerIndex}`,
      toKey: `card-${g.accusedPid}`,
    }));
  }, [guessData]);

  const guessNoteRotations = useMemo(() => {
    return guessData.map(() => Math.floor(3 - Math.random() * 6));
  }, [guessData.length]);

  const stringPositions = useStringPositions(corkRef, elementRefs.current, stringConnections);

  return (
    <CorkBoard corkRef={corkRef}>
      <RedStrings
        connections={stringPositions}
        width={corkSize.width}
        height={corkSize.height}
      />
      <Box sx={{ display: 'flex', height: '100%', p: 3, gap: 3 }}>
        <Box sx={{ flex: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
            <Box sx={{ width: '100%' }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  mb: 1,
                }}
              >
                <Pushpin color="#094067" />
                <Box
                  sx={{
                    bgcolor: '#f8f6f0',
                    px: 2,
                    py: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"kingthings_trypewriter_2Rg", serif',
                      fontSize: '1.5rem',
                      color: '#094067',
                      letterSpacing: '-1px',
                    }}
                  >
                    {t('Game')} — {t('Round')} {gameState.round} {t('of')} 3
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"kingthings_trypewriter_2Rg", serif',
                      fontSize: '0.9rem',
                      color: '#5f6c7b',
                      letterSpacing: '-1px',
                    }}
                  >
                    {t('Suspects of the crime:')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {suspects.map((player) => {
              const rotation = cardRotations[player.id]?.card || 0;
              const offsetY = cardOffsets[player.id] || 0;
              const playerMeans = gameState.means.slice(player.index * 4, player.index * 4 + 4);
              const playerClues = gameState.clues.slice(player.index * 4, player.index * 4 + 4);

              return (
                <Box
                  key={player.id}
                  ref={(el: HTMLDivElement | null) => setElementRef(`card-${player.id}`, el)}
                  sx={{ width: 220 }}
                >
                  <PolaroidCard
                    name={player.name}
                    means={playerMeans}
                    clues={playerClues}
                    rotation={rotation}
                    offsetY={offsetY}
                    passedTurn={gameState.passedTurns?.[player.index]}
                    passedTurnLabel={t('Passed this turn')}
                  />
                </Box>
              );
            })}
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            {guessData.map((guess, i) => (
              <GuessNote
                key={guess.playerIndex}
                ref={(el: HTMLDivElement | null) => setElementRef(`guess-${guess.playerIndex}`, el)}
                accuserName={guess.accuserName}
                accusedName={guess.accusedName}
                mean={guess.mean}
                evidenceKey={guess.evidenceKey}
                isWrong={guess.isWrong}
                rotation={guessNoteRotations[i]}
                moLabel={t('the M.O. was')}
                keyEvidenceLabel={t('and the key evidence was')}
                saidThatLabel={t('said that')}
                didItLabel={t('did it')}
              />
            ))}
          </Box>
        </Box>

        <ForensicSheet
          detectiveName={detectiveName}
          analysis={gameState.analysis}
          forensicAnalysis={gameState.forensicAnalysis}
          round={gameState.round}
          forensicScientistLabel={t('Forensic Scientist')}
        />
      </Box>
    </CorkBoard>
  );
}
