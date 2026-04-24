import { useState, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useI18n } from '../../hooks/useI18n';
import type { AnalysisItem } from '../../data/analysis';
import { GluedNote, SheetFrame, SheetHeader, SlotRow } from './forensicSheetParts';
import { ROUND_1_COUNT, randomRotation } from './forensicSheetConfig';
import StampButton from './StampButton';

interface ForensicSheetFillableProps {
  analysis: AnalysisItem[];
  availableClues: number;
  forensicAnalysis?: string[];
  detectiveName: string;
  onSubmit: (values: string[]) => Promise<void> | void;
  disabled?: boolean;
}

export default function ForensicSheetFillable({
  analysis,
  availableClues,
  forensicAnalysis,
  detectiveName,
  onSubmit,
  disabled,
}: ForensicSheetFillableProps) {
  const { t } = useI18n();

  const [values, setValues] = useState<string[]>(() => {
    const initial = new Array(availableClues).fill('');
    forensicAnalysis?.forEach((v, i) => {
      if (i < availableClues) initial[i] = v;
    });
    return initial;
  });

  useEffect(() => {
    setValues((prev) => {
      const next = new Array(availableClues).fill('');
      for (let i = 0; i < availableClues; i++) {
        next[i] = forensicAnalysis?.[i] ?? prev[i] ?? '';
      }
      return next;
    });
  }, [availableClues, forensicAnalysis]);

  const isLocked = (index: number) =>
    !!(forensicAnalysis && forensicAnalysis[index]);

  const allFilled = values.length === availableClues && values.every((v) => v);
  const allSubmitted =
    !!forensicAnalysis &&
    forensicAnalysis.length >= availableClues &&
    forensicAnalysis.slice(0, availableClues).every((v) => v);

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async () => {
    if (!allFilled) return;
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const gluedNoteRotations = useMemo(
    () =>
      Array.from(
        { length: Math.max(availableClues - ROUND_1_COUNT, 0) },
        () => randomRotation(),
      ),
    [availableClues],
  );

  const handleChange = (index: number, v: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
  };

  const round1Count = Math.min(availableClues, ROUND_1_COUNT);
  const laterCount = Math.max(availableClues - ROUND_1_COUNT, 0);

  const submitBlock = (
    <Box
      sx={{
        mt: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 72,
      }}
    >
      {allSubmitted ? (
        <Box
          key="stamp"
          className="krimi-anim-stamp"
          sx={{
            border: '3px solid rgba(0, 0, 0, 0.45)',
            borderRadius: '4px',
            px: 2,
            py: 0.5,
            display: 'inline-block',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '1.4rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: 'rgba(0, 0, 0, 0.5)',
              letterSpacing: '3px',
              whiteSpace: 'nowrap',
            }}
          >
            {t('SUBMITTED')}
          </Typography>
        </Box>
      ) : (
        <Box key="button" className="krimi-anim-fade">
          <StampButton
            onClick={handleSubmit}
            disabled={!allFilled || submitting}
          >
            {t('Send analysis')}
          </StampButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ position: 'relative', width: 340 }}>
      <SheetFrame>
        <SheetHeader
          title={t('Forensic Analysis')}
          detectiveName={detectiveName}
          forensicScientistLabel={t('Forensic Scientist')}
        />

        {Array.from({ length: round1Count }).map((_, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <SlotRow
              index={index}
              title={analysis[index]?.title ?? ''}
              value={values[index] ?? ''}
              locked={isLocked(index)}
              options={analysis[index]?.options ?? []}
              onChange={(v) => handleChange(index, v)}
              disabled={disabled}
            />
          </Box>
        ))}

        {Array.from({ length: laterCount }).map((_, i) => {
          const index = ROUND_1_COUNT + i;
          return (
            <GluedNote
              key={index}
              rotation={gluedNoteRotations[i] ?? 0}
              zIndex={1 + i}
            >
              <SlotRow
                index={index}
                title={analysis[index]?.title ?? ''}
                value={values[index] ?? ''}
                locked={isLocked(index)}
                options={analysis[index]?.options ?? []}
                onChange={(v) => handleChange(index, v)}
                disabled={disabled}
              />
            </GluedNote>
          );
        })}

        {submitBlock}
      </SheetFrame>
    </Box>
  );
}
