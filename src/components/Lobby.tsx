import { useState, useMemo, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import { motion, AnimatePresence } from 'motion/react';
import { buildJoinUrl, useRoomState } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import { useMasonryLayout } from '../hooks/useMasonryLayout';
import CorkBoard from './board/CorkBoard';
import CasePolaroid from './board/CasePolaroid';
import AssigningCaseSheet from './board/AssigningCaseSheet';
import PolaroidCard from './board/PolaroidCard';

const MAX_PLAYERS = 12;
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

  const masonryRef = useRef<HTMLDivElement>(null);
  const masonry = useMasonryLayout(masonryRef, readyPlayers.length, CARD_COLUMN_WIDTH, CARD_GAP);

  if (!roomState) return null;

  const detectiveName = readyPlayers[activeDetective]?.name;

  return (
    <CorkBoard>
      <Box sx={{ display: 'flex', height: '100%', p: 3, gap: 3 }}>
        <Box>
          <CasePolaroid
            roomId={roomState.roomId}
            joinUrl={joinUrl}
            currentRound={0}
          />
          <AssigningCaseSheet
            detectiveName={detectiveName}
            count={readyPlayers.length}
            maxCount={MAX_PLAYERS}
            canStart={canStart}
            onStart={() => startTheGame(activeDetective)}
          />
        </Box>

        <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            <Box
              ref={masonryRef}
              sx={{ position: 'relative', width: '100%', height: masonry.containerHeight }}
            >
              <AnimatePresence>
                {readyPlayers.map((slot, i) => {
                  const style = masonry.styles[i];
                  return (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, scale: 0.7, y: -40 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.6, y: 20 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      ref={(el: HTMLDivElement | null) => masonry.setItemRef(i, el)}
                      style={{
                        width: CARD_COLUMN_WIDTH,
                        position: 'absolute',
                        left: style?.left ?? 0,
                        top: style?.top ?? 0,
                      }}
                    >
                      <PolaroidCard
                        name={slot.name ?? ''}
                        slotLabel={`${t('Player')} ${i + 1}`}
                        role={i === activeDetective ? 'detective' : 'investigator'}
                        onToggleRole={() => setActiveDetective(i)}
                        rotation={cardRotations[slot.id] ?? 0}
                        offsetY={cardOffsets[slot.id] ?? 0}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </Box>
          </Box>
        </Box>
      </Box>
    </CorkBoard>
  );
}
