import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { AnimatePresence, motion } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import Lobby from '../components/Lobby';
import Board from '../components/Board';

export default function Room() {
  const { id } = useParams<{ id: string }>();
  const { roomState, gameState, loading, loadRoom } = useGame();

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id, loadRoom]);

  if (loading || !roomState) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {gameState?.started ? (
        <motion.div key="board" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
          <Board />
        </motion.div>
      ) : (
        <motion.div
          key="lobby"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.9, 0.5] }}
        >
          <Lobby />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
