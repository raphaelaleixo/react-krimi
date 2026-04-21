import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';
import StampButton from './StampButton';
import { useI18n } from '../../hooks/useI18n';

interface AssigningCaseSheetProps {
  detectiveName: string | undefined;
  count: number;
  maxCount: number;
  canStart: boolean;
  onStart: () => void;
}

export default function AssigningCaseSheet({
  detectiveName,
  count,
  maxCount,
  canStart,
  onStart,
}: AssigningCaseSheetProps) {
  const { t } = useI18n();

  return (
    <Box sx={{ position: 'relative', width: 340 }}>
      <Pushpin color="#4a7c59" />

      <Box
        sx={{
          bgcolor: '#f8f6f0',
          p: 3,
          boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 27px, #e8e4da 27px, #e8e4da 28px)',
          backgroundPosition: '0 48px',
        }}
      >
        {/* Header */}
        <Typography
          sx={{
            fontFamily: 'var(--font-typewriter)',
            fontSize: '1.4rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--text-color)',
            textAlign: 'center',
            mb: 0.5,
          }}
        >
          {t('Assigning case')}
        </Typography>

        {/* Detective signature — mirrors ForensicSheet */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography
            component="span"
            sx={{
              fontFamily: 'var(--font-script)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: 'var(--evidence-color)',
              minHeight: '1.5rem',
              display: 'inline-block',
            }}
          >
            {detectiveName ?? '\u00A0'}
          </Typography>
          <Box
            sx={{
              borderTop: '1px dashed var(--text-color)',
              mt: 0.5,
              mx: 'auto',
              width: '60%',
            }}
          />
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '0.8rem',
              letterSpacing: '1px',
              color: '#5f6c7b',
            }}
          >
            {t('Forensic Scientist')}
          </Typography>
        </Box>

        {/* Counter */}
        <Typography
          sx={{
            fontFamily: 'var(--font-typewriter)',
            fontSize: '1rem',
            color: 'var(--text-color)',
            textAlign: 'center',
            mb: 3,
          }}
        >
          {count} / {maxCount} {t('on scene')}
        </Typography>

        {/* Start button */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <StampButton variant="primary" disabled={!canStart} onClick={onStart}>
            {t('Start investigation')}
          </StampButton>
        </Box>
      </Box>
    </Box>
  );
}
