import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import InfoIcon from '@mui/icons-material/Info';
import { RoomInfoModal } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import Lobby from '../components/Lobby';
import Board from '../components/Board';

export default function Room() {
  const { id } = useParams<{ id: string }>();
  const { roomState, gameState, loading, loadRoom } = useGame();
  const [infoOpen, setInfoOpen] = useState(false);

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
    <>
      {gameState?.started ? <Board /> : <Lobby />}

      {/* Floating button to show room info modal with QR/player links */}
      <Fab
        size="small"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setInfoOpen(true)}
      >
        <InfoIcon />
      </Fab>

      <RoomInfoModal
        roomState={roomState}
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </>
  );
}
