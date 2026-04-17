import { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { useGame } from '../contexts/GameContext';
import CorkBoard from './board/CorkBoard';
import { useI18n } from '../hooks/useI18n';

function randomRotation() {
  return parseInt(String(3 - Math.random() * 6));
}

export default function Board() {
  const { gameState } = useGame();
  const { t } = useI18n();

  // Memoize random rotations so they don't change on re-render
  const cardRotations = useMemo(() => {
    if (!gameState) return {};
    const rotations: Record<number, { card: number; stamp: number }> = {};
    gameState.playerOrder.forEach((pid) => {
      rotations[pid] = { card: randomRotation(), stamp: randomRotation() };
    });
    return rotations;
  }, [gameState?.playerOrder]);

  const analysisRotations = useMemo(() => {
    if (!gameState?.forensicAnalysis) return [];
    return gameState.forensicAnalysis.map(() => randomRotation());
  }, [gameState?.forensicAnalysis]);

  if (!gameState) return null;

  const suspects = gameState.playerOrder
    .map((pid, idx) => ({ id: pid, index: idx, name: gameState.playerNames[pid] }))
    .filter((p) => p.index !== gameState.detective);

  const detectiveName =
    gameState.playerNames[gameState.playerOrder[gameState.detective]] || 'Detective';

  const allPlayers = gameState.playerOrder.map((pid, idx) => ({
    id: pid,
    index: idx,
    name: gameState.playerNames[pid],
  }));

  return (
    <CorkBoard>
      <Box sx={{ display: 'flex', height: '100%', p: 3, gap: 3 }}>
        <Box sx={{ flex: 3 }}>
          <Grid container>
            <Grid size={12}>
              <Typography variant="h2">
                {t('Game')}{' '}
                <Box
                  component="code"
                  sx={{ color: 'error.main', textTransform: 'uppercase' }}
                >
                  {gameState.playerOrder.length > 0 ? '' : ''}
                </Box>
                <Typography component="small" sx={{ ml: { lg: 4 }, fontSize: '0.5em' }}>
                  {t('Round')} {gameState.round} {t('of')} 3
                </Typography>
              </Typography>
              <Typography variant="h4" sx={{ my: 4 }}>
                {t('Suspects of the crime:')}
              </Typography>
            </Grid>

            {suspects.map((player) => {
              const rotation = cardRotations[player.id] || { card: 0, stamp: 0 };
              const playerMeans = gameState.means.slice(player.index * 4, player.index * 4 + 4);
              const playerClues = gameState.clues.slice(player.index * 4, player.index * 4 + 4);

              return (
                <Grid
                  key={player.id}
                  size={{ md: 6, xl: 3 }}
                  sx={{
                    position: 'relative',
                    // Sticky tape effect
                    '&::before': {
                      content: '""',
                      display: 'block',
                      width: '5em',
                      height: '2em',
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      zIndex: 1,
                      background: 'rgba(255, 255, 200, 0.4)',
                      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
                      transform: 'translate(-50%, -10%)',
                    },
                  }}
                >
                  {/* Stamp overlay */}
                  {gameState.finished && (
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        top: '50%',
                        left: '50%',
                        zIndex: 2,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '2em',
                        fontFamily: '"kingthings_trypewriter_2Rg", serif',
                        letterSpacing: '-1px',
                        textTransform: 'uppercase',
                        color: '#00000080',
                        textShadow:
                          '1px -1px rgba(0, 0, 0, 0.7), -1px 1px rgba(255, 255, 255, 0.7)',
                        transform: `translate(-50%, -50%) rotate(${rotation.stamp}deg)`,
                      }}
                    >
                      {gameState.murderer === player.index ? (
                        <Box component="span" sx={{ color: '#ff5252' }}>
                          Murderer
                        </Box>
                      ) : (
                        <span>Detective</span>
                      )}
                    </Box>
                  )}

                  <Card
                    sx={{
                      transform: `rotate(${rotation.card}deg)`,
                      transition: 'all 0.3s ease-out',
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6">{player.name}</Typography>

                      {gameState.passedTurns && gameState.passedTurns[player.index] && (
                        <Typography
                          sx={{
                            fontFamily: '"Shadows Into Light", cursive',
                            fontSize: 18,
                            fontWeight: 'bold',
                          }}
                        >
                          {t('Passed this turn')}
                        </Typography>
                      )}

                      {gameState.guesses &&
                        gameState.guesses[player.index] &&
                        typeof gameState.guesses[player.index] === 'object' && (
                          <Typography
                            sx={{
                              fontFamily: '"Shadows Into Light", cursive',
                              fontSize: 18,
                              fontWeight: 'bold',
                              color: '#5f6c7b',
                            }}
                          >
                            {t('Guessed that the murderer was')}{' '}
                            {allPlayers[(gameState.guesses[player.index] as any).player]?.name},{' '}
                            {t('the M.O. was')}{' '}
                            {(gameState.guesses[player.index] as any).mean}{' '}
                            {t('and the key evidence was')}{' '}
                            {(gameState.guesses[player.index] as any).key}
                          </Typography>
                        )}

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        {playerMeans.map((mean) => (
                          <Chip
                            key={mean}
                            label={mean}
                            size="small"
                            sx={{ bgcolor: '#bbdefb' }}
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {playerClues.map((clue) => (
                          <Chip
                            key={clue}
                            label={clue}
                            size="small"
                            sx={{ bgcolor: '#ffcdd2' }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}

            {gameState.finished && (
              <Grid size={12}>
                <Typography
                  sx={{
                    mt: 2,
                    fontSize: '2em',
                    color: '#ff5252',
                    fontWeight: 'bold',
                    fontFamily: '"Shadows Into Light", cursive',
                  }}
                >
                  The game is finished. The {gameState.winner} won!
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Analysis sidebar */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ mb: 4 }}>
            {t('Analysis')}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                fontFamily: '"Shadows Into Light", cursive',
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: '1.25em',
                  color: '#3da9fc',
                  letterSpacing: 0,
                }}
              >
                {detectiveName}
              </Box>
              <Box
                component="span"
                sx={{
                  fontFamily: '"kingthings_trypewriter_2Rg", serif',
                  fontSize: '0.5em',
                  lineHeight: 1.2,
                  wordSpacing: '5px',
                  borderTop: '1px dashed #094067',
                }}
              >
                {t('Forensic Scientist')}
              </Box>
            </Box>
          </Typography>

          {gameState.forensicAnalysis &&
            gameState.forensicAnalysis.map((item, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  transform: `rotate(${analysisRotations[index] || 0}deg)`,
                }}
              >
                <CardContent>
                  <Box
                    component="strong"
                    sx={{
                      fontFamily: '"kingthings_trypewriter_2Rg", serif',
                      mr: 1,
                    }}
                  >
                    {index + 1} {gameState.analysis[index]?.title}:
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      fontFamily: '"Shadows Into Light", cursive',
                      fontWeight: 'bold',
                      fontSize: '1.5em',
                      color: '#3da9fc',
                      display: 'inline-block',
                    }}
                  >
                    {item}
                  </Box>
                </CardContent>
              </Card>
            ))}
        </Box>
      </Box>
    </CorkBoard>
  );
}
