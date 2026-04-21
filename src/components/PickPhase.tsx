import { useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import CheckIcon from '@mui/icons-material/Check';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import type { KrimiGameState } from '../types';

interface PickPhaseProps {
  gameState: KrimiGameState;
  playerId: number;
  playerOrderIndex: number;
}

export default function PickPhase({ gameState, playerId, playerOrderIndex }: PickPhaseProps) {
  const { submitPick } = useGame();
  const { t } = useI18n();

  const existingPick = gameState.playerPicks?.[playerOrderIndex];

  const [selectedMean, setSelectedMean] = useState<string | null>(
    existingPick?.mean ?? null
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(
    existingPick?.key ?? null
  );
  const [submitting, setSubmitting] = useState(false);

  const submitted = !!existingPick;

  const playerMeans = gameState.means.slice(
    playerOrderIndex * 4,
    playerOrderIndex * 4 + 4
  );
  const playerClues = gameState.clues.slice(
    playerOrderIndex * 4,
    playerOrderIndex * 4 + 4
  );

  const playerName = gameState.playerNames[playerId] || `Player ${playerId}`;

  const handleSubmit = async () => {
    if (!selectedMean || !selectedKey) return;
    setSubmitting(true);
    try {
      await submitPick(playerOrderIndex, { mean: selectedMean, key: selectedKey });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ mx: 'auto' }}>
          <Typography variant="h2" sx={{ mb: 4 }}>
            {playerName}
          </Typography>
          <Card>
            <CardContent>
              {submitted ? (
                <Typography variant="body1">
                  {t('Waiting for other players to submit their picks...')}
                </Typography>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {t('If you were the murderer, which cards would you want found at the scene?')}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t('Select your means of murder:')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
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

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t('Select your key evidence:')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
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

                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!selectedMean || !selectedKey || submitting}
                  >
                    {t('Submit pick')}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
