import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { RoomQRCode, buildJoinUrl } from 'react-gameroom';
import CorkBoard from './board/CorkBoard';
import PolaroidCard from './board/PolaroidCard';
import ForensicSheet from './board/ForensicSheet';
import GuessNote from './board/GuessNote';

import { useI18n } from '../hooks/useI18n';
import { useMasonryLayout } from '../hooks/useMasonryLayout';


function randomRotation() {
  return parseInt(String(3 - Math.random() * 6));
}

function generateDistressedLine() {
  const topPoints: string[] = [];
  const bottomPoints: string[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    const topBite = Math.random() < 0.35 ? Math.random() * 30 : 0;
    const bottomBite = Math.random() < 0.35 ? Math.random() * 30 : 0;
    topPoints.push(`${x.toFixed(1)}% ${topBite.toFixed(1)}%`);
    bottomPoints.unshift(`${x.toFixed(1)}% ${(100 - bottomBite).toFixed(1)}%`);
  }
  return `polygon(${[...topPoints, ...bottomPoints].join(', ')})`;
}

function generateDistressedCircle() {
  const points: string[] = [];
  const steps = 72;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    // Mostly clean edge with occasional random notches
    const bite = Math.random() < 0.3 ? (Math.random() * 8) : 0;
    const r = 50 - bite;
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  return `polygon(${points.join(', ')})`;
}

export default function Board() {
  const { gameState, roomState } = useGame();
  const { t } = useI18n();

  const joinUrl = useMemo(
    () => buildJoinUrl(roomState?.roomId || ''),
    [roomState?.roomId]
  );

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
  const masonryRef = useRef<HTMLDivElement>(null);
  const elementRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  const setElementRef = useCallback((key: string, el: HTMLElement | null) => {
    elementRefs.current.set(key, el);
  }, []);

  const suspectCount = gameState ? gameState.playerOrder.length - 1 : 0;
  const masonry = useMasonryLayout(masonryRef, suspectCount, 220, 24);

  // Calculate vertical centering offset manually so we can animate it
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [centerOffset, setCenterOffset] = useState(0);

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;
      const spare = container.clientHeight - content.scrollHeight;
      setCenterOffset(Math.max(0, spare / 2));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  });



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

  const guessCountByPlayer = useMemo(() => {
    const counts: Record<number, number> = {};
    guessData.forEach((g) => {
      counts[g.accusedPid] = (counts[g.accusedPid] || 0) + 1;
    });
    return counts;
  }, [guessData]);

  const stampClipPaths = useMemo(() => [
    generateDistressedCircle(),
    generateDistressedCircle(),
    generateDistressedCircle(),
  ], []);

  const crossClipPaths = useMemo(() => [
    [generateDistressedLine(), generateDistressedLine()],
    [generateDistressedLine(), generateDistressedLine()],
    [generateDistressedLine(), generateDistressedLine()],
  ], []);

  const guessNoteRotations = useMemo(() => {
    return guessData.map(() => Math.floor(3 - Math.random() * 6));
  }, [guessData.length]);

  return (
    <CorkBoard corkRef={corkRef}>
      <Box sx={{ display: 'flex', height: '100%', p: 3, gap: 3 }}>
        <Box>
          {/* Join QR polaroid */}
          {roomState && (
          <Box
            component="a"
            href={joinUrl}
            target="_blank"
            sx={{
              mb: 3,
              display: 'block',
              textDecoration: 'none',
              transform: 'rotate(2deg)',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'rotate(0deg) scale(1.03)' },
            }}
          >
            <Box
              sx={{
                bgcolor: '#f5f5f0',
                p: 1.5,
                pb: 4,
                boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
              }}
            >
              <Box sx={{
                bgcolor: '#fff',
                border: '1px solid #e0ddd5',
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                '& svg': { width: '100%', maxWidth: 150, height: 'auto', display: 'block' },
              }}>
                <RoomQRCode
                  roomId={roomState.roomId}
                  url={joinUrl}
                  size={150}
                />
              </Box>
              <Typography
                sx={{
                  fontFamily: '"kingthings_trypewriter_2Rg", serif',
                  fontSize: '2.2rem',
                  color: 'var(--text-color)',
                  textAlign: 'center',
                  mt: 1.5,
                  fontWeight: 'bold',
                  letterSpacing: '-1px',
                }}
              >
                {t('Case')}#{roomState.roomId}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mt: -0.5, justifyContent: 'center' }}>
                {[1, 2, 3].map((r) => (
                  <Box
                    key={r}
                    sx={{
                      position: 'relative',
                      width: 48,
                      height: 48,
                      border: '3px solid',
                      borderColor: 'var(--weapon-color)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `rotate(${[-8, 3, -5][r - 1]}deg)`,
                      clipPath: stampClipPaths[r - 1],
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"kingthings_trypewriter_2Rg", serif',
                        fontSize: '1.4rem',
                        fontWeight: 'bold',
                        color: 'var(--weapon-color)',
                        lineHeight: 1,
                      }}
                    >
                      {r}
                    </Typography>
                    {r <= gameState.round && (
                      <>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '-4px',
                            right: '-4px',
                            height: '3px',
                            bgcolor: 'var(--evidence-color)',
                            transform: 'rotate(-25deg)',
                            transformOrigin: 'center',
                            clipPath: crossClipPaths[r - 1][0],
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '-4px',
                            right: '-4px',
                            height: '3px',
                            bgcolor: 'var(--evidence-color)',
                            transform: 'rotate(25deg)',
                            transformOrigin: 'center',
                            clipPath: crossClipPaths[r - 1][1],
                          }}
                        />
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
          )}

          <ForensicSheet
            detectiveName={detectiveName}
            analysis={gameState.analysis}
            forensicAnalysis={gameState.forensicAnalysis}
            round={gameState.round}
            forensicScientistLabel={t('Forensic Scientist')}
          />
        </Box>

        <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>

          <Box ref={containerRef} sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <motion.div
            ref={contentRef}
            animate={{ y: centerOffset }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
          <Box ref={masonryRef} sx={{ position: 'relative', width: '100%', height: masonry.containerHeight }}>
            {suspects.map((player, i) => {
              const rotation = cardRotations[player.id]?.card || 0;
              const offsetY = cardOffsets[player.id] || 0;
              const playerMeans = gameState.means.slice(player.index * 4, player.index * 4 + 4);
              const playerClues = gameState.clues.slice(player.index * 4, player.index * 4 + 4);
              const masonryStyle = masonry.styles[i];

              return (
                <Box
                  key={player.id}
                  ref={(el: HTMLDivElement | null) => {
                    setElementRef(`card-${player.id}`, el);
                    masonry.setItemRef(i, el);
                  }}
                  sx={{ width: 220, ...(masonryStyle || {}) }}
                >
                  <PolaroidCard
                    name={player.name}
                    means={playerMeans}
                    clues={playerClues}
                    rotation={rotation}
                    offsetY={offsetY}
                    stamp={gameState.passedTurns?.[player.index] ? t('Passed') : undefined}
                    guessCount={guessCountByPlayer[player.id] || 0}
                  />
                </Box>
              );
            })}
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignContent: 'flex-start', pt: 3, pl: `${masonry.offsetX}px` }}>
            <AnimatePresence>
            {guessData.map((guess, i) => (
              <motion.div
                key={guess.playerIndex}
                layout
                initial={{ opacity: 0, scale: 0.4, y: -30, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: guessNoteRotations[i] }}
                transition={{
                  layout: { type: 'spring', stiffness: 300, damping: 25 },
                  opacity: { duration: 0.3 },
                  scale: { type: 'spring', stiffness: 400, damping: 20 },
                  y: { type: 'spring', stiffness: 400, damping: 20 },
                }}
                style={{ marginLeft: i > 0 ? -16 : 0, marginTop: guessNoteRotations[i] * 3 }}
              >
              <GuessNote
                ref={(el: HTMLDivElement | null) => setElementRef(`guess-${guess.playerIndex}`, el)}
                accuserName={guess.accuserName}
                accusedName={guess.accusedName}
                mean={guess.mean}
                evidenceKey={guess.evidenceKey}
                isWrong={guess.isWrong}
                rotation={0}
                moLabel={t('the M.O. was')}
                keyEvidenceLabel={t('and the key evidence was')}
                saidThatLabel={t('said that')}
                didItLabel={t('did it')}
              />
              </motion.div>
            ))}
            </AnimatePresence>
          </Box>
          </motion.div>
          </Box>
        </Box>

      </Box>
    </CorkBoard>
  );
}
