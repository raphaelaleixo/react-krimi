import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import { motion, AnimatePresence } from 'motion/react';
import { buildJoinUrl, useRoomState } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import { useMasonryLayout } from '../hooks/useMasonryLayout';
import CorkBoard from './board/CorkBoard';
import CasePolaroid from './board/CasePolaroid';
import AssigningCaseSheet from './board/AssigningCaseSheet';
import PlayerFile from './board/PlayerFile';
import WaitingNote from './board/WaitingNote';

const CARD_COLUMN_WIDTH = 220;
const CARD_GAP = 24;

function randomRotation() {
  return parseInt(String(3 - Math.random() * 6));
}

function randomOffset() {
  return Math.floor(Math.random() * 20) - 10;
}

export default function Lobby() {
  const { roomState, startTheGame } = useGame();
  const { t } = useI18n();
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

  const masonryRef = useRef<HTMLDivElement>(null);
  const masonry = useMasonryLayout(masonryRef, investigators.length, CARD_COLUMN_WIDTH, CARD_GAP);

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
    <CorkBoard>
      <Box sx={{ display: 'flex', p: 3, gap: 3 }}>
        <Box>
          <CasePolaroid
            roomId={roomState.roomId}
            joinUrl={joinUrl}
            crossedRounds={0}
          />
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
        </Box>

        <Box sx={{ flex: 3 }}>
          <motion.div
            ref={masonryRef}
            animate={{ height: masonry.containerHeight }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ position: 'relative', width: '100%' }}
          >
            <AnimatePresence>
              {investigators.map(({ slot, originalIndex }, j) => {
                const style = masonry.styles[j];
                return (
                  <motion.div
                    key={slot.id}
                    layout
                    initial={{ opacity: 0, scale: 0.7, y: -40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.6, y: 20 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                      layout: { type: 'spring', stiffness: 300, damping: 30 },
                    }}
                    ref={(el: HTMLDivElement | null) => masonry.setItemRef(j, el)}
                    style={{
                      width: CARD_COLUMN_WIDTH,
                      position: 'absolute',
                      left: style?.left ?? 0,
                      top: style?.top ?? 0,
                    }}
                  >
                    <PlayerFile
                      name={slot.name ?? ''}
                      slotLabel={`${t('Player')} ${originalIndex + 1}`}
                      rotation={cardRotations[slot.id] ?? 0}
                      offsetY={cardOffsets[slot.id] ?? 0}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

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
        </Box>
      </Box>
    </CorkBoard>
  );
}
