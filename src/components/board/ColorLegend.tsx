import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useI18n } from '../../hooks/useI18n';
import Pushpin from './Pushpin';

export default function ColorLegend() {
  const { t } = useI18n();

  const row = (swatchColor: string, label: string) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 14,
          height: 14,
          bgcolor: swatchColor,
          borderRadius: '2px',
          boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.2)',
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          fontFamily: 'var(--font-typewriter)',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: 'var(--text-color)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ position: 'relative', width: 220, mx: 'auto' }}>
      <Pushpin color="#c9a43a" />
      <Box
        sx={{
          bgcolor: '#f8f6f0',
          px: 2,
          py: 1.25,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
        }}
      >
        {row('var(--weapon-color)', t('Means of Murder'))}
        {row('var(--evidence-color)', t('Key Evidence'))}
      </Box>
    </Box>
  );
}
