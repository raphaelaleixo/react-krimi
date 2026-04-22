import { useMemo, useRef } from "react";
import Box from "@mui/material/Box";
import { useGame } from "../contexts/GameContext";
import { buildJoinUrl } from "react-gameroom";
import CaseBoardLayout from "./board/CaseBoardLayout";
import CasePolaroid from "./board/CasePolaroid";
import PlayerFile from "./board/PlayerFile";
import ForensicSheet from "./board/ForensicSheet";
import { ROUND_1_COUNT } from "./board/forensicSheetConfig";
import GuessNote from "./board/GuessNote";
import PassNote from "./board/PassNote";
import WaitingNote from "./board/WaitingNote";

import { useI18n } from "../hooks/useI18n";
import { isForensicReady } from "../utils/rules";
import RoundTitleCard from "./board/RoundTitleCard";
import GameOverReveal from "./board/GameOverReveal";

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

  const forensicReady = isForensicReady(gameState);

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

  const murdererName =
    gameState.playerNames[gameState.playerOrder[gameState.murderer]] ||
    "";

  return (
    <>
      <RoundTitleCard round={gameState.round} detectiveName={detectiveName} />
      <GameOverReveal
        finished={gameState.finished}
        roomId={roomState?.roomId ?? ''}
        winner={gameState.winner}
        murdererName={murdererName}
        murdererMeans={gameState.means.slice(gameState.murderer * 4, gameState.murderer * 4 + 4)}
        murdererClues={gameState.clues.slice(gameState.murderer * 4, gameState.murderer * 4 + 4)}
        murdererChoice={gameState.murdererChoice}
      />
    <CaseBoardLayout
      corkRef={corkRef}
      animateItems
      items={suspects}
      getItemKey={(p) => p.id}
      leftPanel={
        <>
          {roomState && (
            <Box className="krimi-anim-pinned">
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
            </Box>
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

          <Box className="krimi-anim-tossed">
            <ForensicSheet
              detectiveName={detectiveName}
              analysis={gameState.analysis}
              forensicAnalysis={gameState.forensicAnalysis}
            />
          </Box>
        </>
      }
      renderItem={(player) => {
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
        const hasPassed = !!gameState.passedTurns?.[player.index];
        const guess = guessByAccuser[player.index];
        const noteRotation = seededRotation(player.index * 101 + 7);

        return (
          <>
            <PlayerFile
              name={player.name}
              means={playerMeans}
              clues={playerClues}
              rotation={rotation}
              offsetY={offsetY}
              guessCount={guessCountByPlayer[player.id] || 0}
              hasPicked={
                stillPicking && !!gameState.playerPicks?.[player.index]
              }
            />
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {hasPassed && (
                <Box
                  key="pass"
                  className="krimi-anim-pinned"
                  sx={{ marginTop: '-40px', transform: `rotate(${noteRotation}deg)` }}
                >
                  <PassNote rotation={0} />
                </Box>
              )}
              {!hasPassed && guess && (
                <Box
                  key="guess"
                  className="krimi-anim-pinned"
                  sx={{ marginTop: '-40px', transform: `rotate(${noteRotation}deg)` }}
                >
                  <GuessNote
                    accusedName={guess.accusedName}
                    mean={guess.mean}
                    evidenceKey={guess.evidenceKey}
                    isWrong={guess.isWrong}
                    rotation={0}
                  />
                </Box>
              )}
            </Box>
          </>
        );
      }}
    />
    </>
  );
}
