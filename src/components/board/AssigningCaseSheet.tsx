import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';
import StampButton from './StampButton';
import TapedNoteButton from './TapedNoteButton';
import { useI18n } from '../../hooks/useI18n';

interface AssigningCaseSheetProps {
  detectiveName: string | undefined;
  count: number;
  maxCount: number;
  canStart: boolean;
  canCycle: boolean;
  onStart: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function AssigningCaseSheet({
  detectiveName,
  count,
  maxCount,
  canStart,
  canCycle,
  onStart,
  onPrev,
  onNext,
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

        {/* Detective signature — arrows cycle the assignment */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              mb: 0.5,
            }}
          >
            <TapedNoteButton
              variant="icon-button"
              rotation={-4}
              disabled={!canCycle}
              onClick={onPrev}
              aria-label={t('Previous')}
            >
              ‹
            </TapedNoteButton>

            <Box sx={{ minWidth: 140 }}>
              <Typography
                component="span"
                sx={{
                  fontFamily: 'var(--font-script)',
                  fontSize: '1.75em',
                  fontWeight: 'bold',
                  color: 'var(--evidence-color)',
                  minHeight: '1.75em',
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
                  width: '100%',
                }}
              />
            </Box>

            <TapedNoteButton
              variant="icon-button"
              rotation={4}
              disabled={!canCycle}
              onClick={onNext}
              aria-label={t('Next')}
            >
              ›
            </TapedNoteButton>
          </Box>
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
          id="assigning-case-counter"
          aria-live="polite"
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
          <StampButton
            variant="primary"
            disabled={!canStart}
            onClick={onStart}
            aria-describedby={!canStart ? 'assigning-case-counter' : undefined}
          >
            {t('Start investigation')}
          </StampButton>
        </Box>
      </Box>
    </Box>
  );
}
