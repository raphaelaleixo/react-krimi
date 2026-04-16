import { useState } from 'react';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CheckIcon from '@mui/icons-material/Check';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import type { KrimiGameState } from '../types';

interface MurdererChoiceProps {
  gameState: KrimiGameState;
  playerOrderIndex: number;
  onChoice: () => void;
}

export default function MurdererChoice({ gameState, playerOrderIndex, onChoice }: MurdererChoiceProps) {
  const { setMurdererChoice } = useGame();
  const { t } = useI18n();
  const [selectedMean, setSelectedMean] = useState<string | null>(
    gameState.murdererChoice?.mean || null
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(
    gameState.murdererChoice?.key || null
  );

  const playerMeans = gameState.means.slice(
    playerOrderIndex * 4,
    playerOrderIndex * 4 + 4
  );
  const playerClues = gameState.clues.slice(
    playerOrderIndex * 4,
    playerOrderIndex * 4 + 4
  );

  const handleSend = async () => {
    if (!selectedMean || !selectedKey) return;
    await setMurdererChoice({ mean: selectedMean, key: selectedKey });
    onChoice();
  };

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="body1" sx={{ mb: 1, textAlign: 'left' }}>
          {t('Select your means of murder:')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {playerMeans.map((mean) => (
            <Chip
              key={mean}
              label={mean}
              size="small"
              icon={selectedMean === mean ? <CheckIcon /> : undefined}
              onClick={() => setSelectedMean(mean)}
              sx={{
                bgcolor: selectedMean === mean ? '#90caf9' : '#bbdefb',
                opacity: 1,
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="body1" sx={{ mb: 1, textAlign: 'left' }}>
          {t('Select your key evidence:')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {playerClues.map((clue) => (
            <Chip
              key={clue}
              label={clue}
              size="small"
              icon={selectedKey === clue ? <CheckIcon /> : undefined}
              onClick={() => setSelectedKey(clue)}
              sx={{
                bgcolor: selectedKey === clue ? '#ef9a9a' : '#ffcdd2',
                opacity: 1,
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>
      </Grid>
      <Grid size={12} sx={{ textAlign: 'center', mt: 2 }}>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={!selectedMean || !selectedKey}
        >
          {t('Send choice')}
        </Button>
      </Grid>
    </Grid>
  );
}
