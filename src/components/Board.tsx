import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { motion, AnimatePresence } from "motion/react";
import { useGame } from "../contexts/GameContext";
import { buildJoinUrl } from "react-gameroom";
import CasePolaroid from "./board/CasePolaroid";
import CorkBoard from "./board/CorkBoard";
import PlayerFile from "./board/PlayerFile";
import ForensicSheet from "./board/ForensicSheet";
import { ROUND_1_COUNT } from "./board/forensicSheetParts";
import GuessNote from "./board/GuessNote";
import WaitingNote from "./board/WaitingNote";

import { useI18n } from "../hooks/useI18n";
import { useMasonryLayout } from "../hooks/useMasonryLayout";

function randomRotation() {
  return parseInt(String(3 - Math.random() * 6));
}

export default function Board() {
  const { gameState, roomState } = useGame();
  const { t } = useI18n();

  const joinUrl = useMemo(
    () => buildJoinUrl(roomState?.roomId || ""),
    [roomState?.roomId],
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

  const stillPicking = !gameState.finished && !gameState.murdererChoice;

  const forensicReady =
    gameState.availableClues > 0 &&
    (gameState.forensicAnalysis?.length ?? 0) >= gameState.availableClues &&
    (gameState.forensicAnalysis ?? [])
      .slice(0, gameState.availableClues)
      .every(Boolean);

  const waitingForensic =
    !gameState.finished && !stillPicking && !forensicReady;

  const suspects = gameState.playerOrder
    .map((pid, idx) => ({
      id: pid,
      index: idx,
      name: gameState.playerNames[pid],
    }))
    .filter((p) => p.index !== gameState.detective);

  const detectiveName =
    gameState.playerNames[gameState.playerOrder[gameState.detective]] ||
    "Detective";

  const guessData = useMemo(() => {
    if (!gameState?.guesses) return [];
    return gameState.guesses
      .map((guess, playerIndex) => {
        if (!guess || typeof guess !== "object") return null;
        const accuserName =
          gameState.playerNames[gameState.playerOrder[playerIndex]];
        const accusedPid = gameState.playerOrder[guess.player];
        const accusedName = gameState.playerNames[accusedPid];
        const isWrong =
          gameState.finished &&
          !(
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

  const guessNoteRotations = useMemo(() => {
    return guessData.map(() => Math.floor(3 - Math.random() * 6));
  }, [guessData.length]);

  return (
    <CorkBoard corkRef={corkRef}>
      <Box sx={{ display: "flex", pt: 3, pr: 3, gap: 3 }}>
        <Box>
          {/* Join QR polaroid */}
          {roomState && (
            <CasePolaroid
              roomId={roomState.roomId}
              joinUrl={joinUrl}
              crossedRounds={Math.max(
                0,
                Math.min(
                  3,
                  (gameState.forensicAnalysis?.filter(Boolean).length ?? 0) -
                    (ROUND_1_COUNT - 1),
                ),
              )}
            />
          )}

          {stillPicking && (
            <WaitingNote
              subtitle={t("Waiting for all players to submit their picks...")}
              width={340}
            />
          )}

          {waitingForensic && (
            <WaitingNote
              subtitle={t("Waiting for the Forensic Scientist...")}
              width={340}
            />
          )}

          <ForensicSheet
            detectiveName={detectiveName}
            analysis={gameState.analysis}
            forensicAnalysis={gameState.forensicAnalysis}
            round={gameState.round}
          />
        </Box>

        <Box sx={{ flex: 3 }}>
          <Box ref={containerRef}>
            <motion.div
              ref={contentRef}
              animate={{ y: centerOffset }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Box
                ref={masonryRef}
                sx={{
                  position: "relative",
                  width: "100%",
                  height: masonry.containerHeight,
                }}
              >
                {suspects.map((player, i) => {
                  const rotation = cardRotations[player.id]?.card || 0;
                  const offsetY = cardOffsets[player.id] || 0;
                  const playerMeans = gameState.means.slice(
                    player.index * 4,
                    player.index * 4 + 4,
                  );
                  const playerClues = gameState.clues.slice(
                    player.index * 4,
                    player.index * 4 + 4,
                  );
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
                      <PlayerFile
                        name={player.name}
                        means={playerMeans}
                        clues={playerClues}
                        rotation={rotation}
                        offsetY={offsetY}
                        stamp={
                          gameState.passedTurns?.[player.index]
                            ? t("Passed")
                            : undefined
                        }
                        guessCount={guessCountByPlayer[player.id] || 0}
                        hasPicked={
                          stillPicking &&
                          !!gameState.playerPicks?.[player.index]
                        }
                      />
                    </Box>
                  );
                })}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  alignContent: "flex-start",
                  pt: 0,
                  pl: `${masonry.offsetX}px`,
                }}
              >
                <AnimatePresence>
                  {guessData.map((guess, i) => (
                    <motion.div
                      key={guess.playerIndex}
                      layout
                      initial={{ opacity: 0, scale: 0.4, y: -30, rotate: 0 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        rotate: guessNoteRotations[i],
                      }}
                      transition={{
                        layout: { type: "spring", stiffness: 300, damping: 25 },
                        opacity: { duration: 0.3 },
                        scale: { type: "spring", stiffness: 400, damping: 20 },
                        y: { type: "spring", stiffness: 400, damping: 20 },
                      }}
                      style={{
                        marginLeft: i > 0 ? -16 : 0,
                        marginTop: guessNoteRotations[i] * 3,
                      }}
                    >
                      <GuessNote
                        ref={(el: HTMLDivElement | null) =>
                          setElementRef(`guess-${guess.playerIndex}`, el)
                        }
                        accuserName={guess.accuserName}
                        accusedName={guess.accusedName}
                        mean={guess.mean}
                        evidenceKey={guess.evidenceKey}
                        isWrong={guess.isWrong}
                        rotation={0}
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
