import { useState, useMemo, useEffect } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import type { KrimiGameState } from '../types';

interface ForensicAnalysisProps {
  gameState: KrimiGameState;
  playerId: number;
  playerOrderIndex: number;
}

export default function ForensicAnalysis({ gameState, playerId }: ForensicAnalysisProps) {
  const { setAnalysis } = useGame();
  const { t } = useI18n();

  const availableClues = useMemo(() => {
    return gameState.analysis.slice(0, gameState.availableClues);
  }, [gameState.analysis, gameState.availableClues]);

  const [analysisValues, setAnalysisValues] = useState<string[]>(
    gameState.forensicAnalysis || new Array(availableClues.length).fill('')
  );

  useEffect(() => {
    if (gameState.forensicAnalysis) {
      setAnalysisValues(gameState.forensicAnalysis);
    }
  }, [gameState.forensicAnalysis]);

  const murderer = useMemo(() => {
    const murdererPlayerId = gameState.playerOrder[gameState.murderer];
    return {
      id: murdererPlayerId,
      name: gameState.playerNames[murdererPlayerId],
    };
  }, [gameState]);

  const handleSend = async () => {
    await setAnalysis(analysisValues);
  };

  const playerName = gameState.playerNames[playerId] || `Player ${playerId}`;

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h2" sx={{ mb: 4 }}>
            {playerName}
          </Typography>

          {!gameState.murdererChoice ? (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('The murderer is')}: <strong>{murderer.name}</strong>
                </Typography>
                <Typography variant="body1">
                  {t('Waiting for the murderer to choose...')}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('The murderer is')}: <strong>{murderer.name}</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t('Means of murder:')}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={gameState.murdererChoice.mean}
                    size="small"
                    sx={{ bgcolor: '#bbdefb' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t('Key evidence:')}
                </Typography>
                <Box>
                  <Chip
                    label={gameState.murdererChoice.key}
                    size="small"
                    sx={{ bgcolor: '#ffcdd2' }}
                  />
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={2}>
            {availableClues.map((item, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <FormControl fullWidth>
                  <InputLabel>{item.title}</InputLabel>
                  <Select
                    value={analysisValues[index] || ''}
                    onChange={(e) => {
                      const newValues = [...analysisValues];
                      newValues[index] = e.target.value;
                      setAnalysisValues(newValues);
                    }}
                    label={item.title}
                  >
                    {item.options.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
          </Grid>
          <Button
            variant="contained"
            color="error"
            sx={{ mt: 3 }}
            onClick={handleSend}
          >
            {t('Send analysis')}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
