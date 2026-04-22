import { useMemo, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import { motion, AnimatePresence } from "motion/react";
import { useGame } from "../contexts/GameContext";
import { buildJoinUrl } from "react-gameroom";
import CasePolaroid from "./board/CasePolaroid";
import CorkBoard from "./board/CorkBoard";
import PlayerFile from "./board/PlayerFile";
import ForensicSheet from "./board/ForensicSheet";
import { ROUND_1_COUNT } from "./board/forensicSheetConfig";
import GuessNote from "./board/GuessNote";
import PassNote from "./board/PassNote";
import WaitingNote from "./board/WaitingNote";

import { useI18n } from "../hooks/useI18n";
import { useMasonryLayout } from "../hooks/useMasonryLayout";

// Deterministic hash so rotations are stable across renders without Math.random().
function hash(seed: number): number {
  return Math.imul(seed | 0, 2654435761) >>> 0;
}

function seededRotation(seed: number): number {
  return (hash(seed) % 5) - 2;
}

function seededOffset(seed: number): number {
  return (hash(seed) % 21) - 10;
}

export default function Board() {
  const { gameState, roomState } = useGame();
  const { t } = useI18n();

  const playerOrder = gameState?.playerOrder;

  const joinUrl = useMemo(
    () => buildJoinUrl(roomState?.roomId || ""),
    [roomState?.roomId],
  );

  const cardRotations = useMemo(() => {
    const rotations: Record<number, { card: number; stamp: number }> = {};
    if (!playerOrder) return rotations;
    playerOrder.forEach((pid) => {
      rotations[pid] = {
        card: seededRotation(pid * 2),
        stamp: seededRotation(pid * 2 + 1),
      };
    });
    return rotations;
  }, [playerOrder]);

  const cardOffsets = useMemo(() => {
    const offsets: Record<number, number> = {};
    if (!playerOrder) return offsets;
    playerOrder.forEach((pid) => {
      offsets[pid] = seededOffset(pid * 3 + 11);
    });
    return offsets;
  }, [playerOrder]);

  const corkRef = useRef<HTMLDivElement>(null);
  const masonryRef = useRef<HTMLDivElement>(null);
  const elementRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  const setElementRef = useCallback((key: string, el: HTMLElement | null) => {
    elementRefs.current.set(key, el);
  }, []);

  const suspectCount = gameState ? gameState.playerOrder.length - 1 : 0;
  const masonry = useMasonryLayout(masonryRef, suspectCount, 220, 24);

  const guessByAccuser = useMemo(() => {
    const map: Record<
      number,
      {
        accusedName: string;
        accusedPid: number;
        mean: string;
        evidenceKey: string;
        isWrong: boolean;
      }
    > = {};
    if (!gameState?.guesses) return map;
    gameState.guesses.forEach((guess, playerIndex) => {
      if (!guess || typeof guess !== "object") return;
      const accusedPid = gameState.playerOrder[guess.player];
      const accusedName = gameState.playerNames[accusedPid];
      const isWrong =
        gameState.finished &&
        !(
          gameState.murdererChoice &&
          guess.mean === gameState.murdererChoice.mean &&
          guess.key === gameState.murdererChoice.key
        );
      map[playerIndex] = {
        accusedName,
        accusedPid,
        mean: guess.mean,
        evidenceKey: guess.key,
        isWrong,
      };
    });
    return map;
  }, [gameState]);

  const guessCountByPlayer = useMemo(() => {
    const counts: Record<number, number> = {};
    Object.values(guessByAccuser).forEach((g) => {
      counts[g.accusedPid] = (counts[g.accusedPid] || 0) + 1;
    });
    return counts;
  }, [guessByAccuser]);

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

  return (
    <CorkBoard corkRef={corkRef}>
      <Box sx={{ display: "flex", p: 3, gap: 3, minHeight: "100vh" }}>
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
          />
        </Box>

        <Box
          sx={{
            flex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            ref={masonryRef}
            animate={{ height: masonry.containerHeight }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ position: "relative", width: "100%" }}
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
                  const hasPassed = !!gameState.passedTurns?.[player.index];
                  const guess = guessByAccuser[player.index];
                  const noteRotation = seededRotation(player.index * 101 + 7);

                  return (
                    <motion.div
                      key={player.id}
                      layout
                      ref={(el: HTMLDivElement | null) => {
                        setElementRef(`card-${player.id}`, el);
                        masonry.setItemRef(i, el);
                      }}
                      transition={{
                        layout: {
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        },
                      }}
                      style={{
                        width: 220,
                        position: "absolute",
                        left: masonryStyle?.left ?? 0,
                        top: masonryStyle?.top ?? 0,
                      }}
                    >
                      <PlayerFile
                        name={player.name}
                        means={playerMeans}
                        clues={playerClues}
                        rotation={rotation}
                        offsetY={offsetY}
                        guessCount={guessCountByPlayer[player.id] || 0}
                        hasPicked={
                          stillPicking &&
                          !!gameState.playerPicks?.[player.index]
                        }
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <AnimatePresence>
                          {hasPassed && (
                            <motion.div
                              key="pass"
                              initial={{
                                opacity: 0,
                                scale: 0.4,
                                y: -30,
                                rotate: 0,
                              }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                rotate: noteRotation,
                              }}
                              exit={{ opacity: 0, scale: 0.4, y: -20 }}
                              transition={{
                                opacity: { duration: 0.3 },
                                scale: {
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 20,
                                },
                                y: {
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 20,
                                },
                              }}
                              style={{ marginTop: -40 }}
                            >
                              <PassNote rotation={0} />
                            </motion.div>
                          )}
                          {!hasPassed && guess && (
                            <motion.div
                              key="guess"
                              initial={{
                                opacity: 0,
                                scale: 0.4,
                                y: -30,
                                rotate: 0,
                              }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                rotate: noteRotation,
                              }}
                              exit={{ opacity: 0, scale: 0.4, y: -20 }}
                              transition={{
                                opacity: { duration: 0.3 },
                                scale: {
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 20,
                                },
                                y: {
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 20,
                                },
                              }}
                              style={{ marginTop: -40 }}
                            >
                              <GuessNote
                                accusedName={guess.accusedName}
                                mean={guess.mean}
                                evidenceKey={guess.evidenceKey}
                                isWrong={guess.isWrong}
                                rotation={0}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Box>
                    </motion.div>
                  );
                })}
              </motion.div>
        </Box>
      </Box>
    </CorkBoard>
  );
}
