import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { buildJoinUrl, useRoomState } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import CaseBoardLayout from './board/CaseBoardLayout';
import CasePolaroid from './board/CasePolaroid';
import AssigningCaseSheet from './board/AssigningCaseSheet';
import PlayerFile from './board/PlayerFile';
import WaitingNote from './board/WaitingNote';
import { useMotionVariants } from '../motion/variants';

function randomRotation() {
  return parseInt(String(3 - Math.random() * 6));
}

function randomOffset() {
  return Math.floor(Math.random() * 20) - 10;
}

export default function Lobby() {
  const { roomState, startTheGame } = useGame();
  const { t } = useI18n();
  const { pinned, tossed } = useMotionVariants();
  const { canStart, readyPlayers } = useRoomState(roomState!);

  const [activeDetective, setActiveDetective] = useState(0);

  // Clamp the detective index if its slot disappears.
  useEffect(() => {
    if (activeDetective >= readyPlayers.length && readyPlayers.length > 0) {
      setActiveDetective(0);
    }
  }, [readyPlayers.length, activeDetective]);

  const joinUrl = useMemo(
    () => buildJoinUrl(roomState?.roomId || ''),
    [roomState?.roomId],
  );

  // Memoise per-slot rotation/offset so they don't re-roll on every render.
  // Keyed on slot ids so they're stable across joins/leaves.
  const slotIdsKey = readyPlayers.map((s) => s.id).join(',');
  const cardRotations = useMemo(() => {
    const map: Record<number, number> = {};
    readyPlayers.forEach((s) => { map[s.id] = randomRotation(); });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotIdsKey]);

  const cardOffsets = useMemo(() => {
    const map: Record<number, number> = {};
    readyPlayers.forEach((s) => { map[s.id] = randomOffset(); });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotIdsKey]);

  // Investigators: everyone except the active detective, preserving original index for slot labels.
  const investigators = useMemo(
    () =>
      readyPlayers
        .map((slot, originalIndex) => ({ slot, originalIndex }))
        .filter(({ originalIndex }) => originalIndex !== activeDetective),
    [readyPlayers, activeDetective],
  );

  const cyclePrev = useCallback(() => {
    if (readyPlayers.length <= 1) return;
    setActiveDetective((i) => (i - 1 + readyPlayers.length) % readyPlayers.length);
  }, [readyPlayers.length]);

  const cycleNext = useCallback(() => {
    if (readyPlayers.length <= 1) return;
    setActiveDetective((i) => (i + 1) % readyPlayers.length);
  }, [readyPlayers.length]);

  if (!roomState) return null;

  const detectiveName = readyPlayers[activeDetective]?.name;

  return (
    <CaseBoardLayout
      animateItems
      items={investigators}
      getItemKey={({ slot }) => slot.id}
      leftPanel={
        <>
          <motion.div variants={pinned} initial="animate" animate="animate" exit="exit">
            <CasePolaroid
              roomId={roomState.roomId}
              joinUrl={joinUrl}
              crossedRounds={0}
            />
          </motion.div>
          <motion.div variants={tossed} initial="animate" animate="animate" exit="exit">
            <AssigningCaseSheet
              detectiveName={detectiveName}
              count={readyPlayers.length}
              maxCount={roomState.config.maxPlayers}
              canStart={canStart}
              canCycle={readyPlayers.length > 1}
              onStart={() => startTheGame(activeDetective)}
              onPrev={cyclePrev}
              onNext={cycleNext}
            />
          </motion.div>
        </>
      }
      renderItem={({ slot, originalIndex }) => (
        <PlayerFile
          name={slot.name ?? ''}
          slotLabel={`${t('Player')} ${originalIndex + 1}`}
          rotation={cardRotations[slot.id] ?? 0}
          offsetY={cardOffsets[slot.id] ?? 0}
        />
      )}
      belowGrid={
        <WaitingNote
          subtitle={
            canStart
              ? t('We can start the game now')
              : t('Waiting for {n} more…').replace(
                  '{n}',
                  String(Math.max(0, roomState.config.minPlayers - readyPlayers.length)),
                )
          }
        />
      }
    />
  );
}
