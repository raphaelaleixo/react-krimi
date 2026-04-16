import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
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

  if (gameState?.started) {
    return <Board />;
  }

  return <Lobby />;
}
