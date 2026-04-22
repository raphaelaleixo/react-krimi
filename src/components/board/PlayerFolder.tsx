import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useI18n } from '../../hooks/useI18n';
import { formatDisplayName } from '../../utils/formatDisplayName';

export interface PlayerFolderProps {
  playerName: string;
  means: string[];
  clues: string[];
  mode: 'select' | 'display';
  selectedMean?: string | null;
  selectedKey?: string | null;
  onSelectMean?: (mean: string) => void;
  onSelectKey?: (key: string) => void;
  stamp?: string | null;
  footer?: ReactNode;
  hideTab?: boolean;
}

const MANILA_BODY = '#d4b87d';
const MANILA_EDGE = '#a88e5a';
const MANILA_INNER_FOLD = 'rgba(0, 0, 0, 0.08)';

export default function PlayerFolder({
  playerName,
  means,
  clues,
  mode,
  selectedMean,
  selectedKey,
  onSelectMean,
  onSelectKey,
  stamp,
  footer,
  hideTab = false,
}: PlayerFolderProps) {
  const { t } = useI18n();
  const isSelect = mode === 'select';

  const renderLine = (
    text: string,
    kind: 'mean' | 'clue',
    isSelected: boolean,
  ) => {
    const handleClick = () => {
      if (kind === 'mean') onSelectMean?.(text);
      else onSelectKey?.(text);
    };
    const interactiveProps = isSelect
      ? {
          component: 'button' as const,
          type: 'button' as const,
          onClick: handleClick,
        }
      : { component: 'div' as const };

    return (
      <Box
        key={`${kind}-${text}`}
        {...interactiveProps}
        sx={{
          position: 'relative',
          display: 'inline-block',
          alignSelf: 'flex-start',
          border: 'none',
          background: 'transparent',
          p: 0,
          m: 0,
          mb: 0.25,
          cursor: isSelect ? 'pointer' : 'default',
          font: 'inherit',
          textAlign: 'left',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-typewriter)',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            lineHeight: 1.5,
            px: 0.5,
          }}
        >
          {text}
        </Typography>
        {isSelected && (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: '-10%',
              left: '-6%',
              width: '112%',
              height: '120%',
              pointerEvents: 'none',
              border: '2.5px solid var(--evidence-color)',
              borderRadius: '55% 45% 52% 48% / 60% 40% 60% 40%',
              transform: 'rotate(-2deg)',
              opacity: 0.85,
            }}
          />
        )}
      </Box>
    );
  };

  const renderSection = (
    label: string,
    items: string[],
    kind: 'mean' | 'clue',
    selected: string | null | undefined,
    color: string,
  ) => (
    <Box sx={{ mb: kind === 'mean' ? 2 : 0 }}>
      <Typography
        sx={{
          fontFamily: 'var(--font-typewriter)',
          fontSize: '0.95rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          color,
          borderBottom: '1px solid rgba(0, 0, 0, 0.35)',
          pb: 0.5,
          mb: 1,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {items.map((item) => renderLine(item, kind, selected === item))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 360, mx: 'auto' }}>
      {/* Tab — slides down into folder body when hideTab flips true */}
      <Box
        component={motion.div}
        initial={{ height: 40 }}
        animate={{ height: hideTab ? 0 : 40 }}
        transition={{ duration: 0.45, delay: hideTab ? 0.3 : 0, ease: [0.4, 0, 0.2, 1] }}
        sx={{ overflow: 'hidden' }}
      >
        <Box
          component={motion.div}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: hideTab ? 40 : 0, opacity: hideTab ? 0 : 1 }}
          transition={{ duration: 0.45, delay: hideTab ? 0.3 : 0, ease: [0.4, 0, 0.2, 1] }}
          sx={{
            position: 'relative',
            width: 210,
            height: 40,
            mx: 'auto',
            bgcolor: '#f8f6f0',
            borderRadius: '6px 6px 0 0',
            borderTop: `1px solid ${MANILA_EDGE}`,
            borderLeft: `1px solid ${MANILA_EDGE}`,
            borderRight: `1px solid ${MANILA_EDGE}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography
            title={playerName}
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '1.15rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: 'var(--text-color)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              px: 2,
            }}
          >
            {formatDisplayName(playerName)}
          </Typography>
        </Box>
      </Box>

      {/* Folder body */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: MANILA_BODY,
          border: `1px solid ${MANILA_EDGE}`,
          borderRadius: '2px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
          px: 3,
          py: 2.5,
        }}
      >
        {/* Subtle fold line near top (folder crease) */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: 6,
            left: 12,
            right: 12,
            height: 0,
            borderTop: `1px solid ${MANILA_INNER_FOLD}`,
            pointerEvents: 'none',
          }}
        />

        {renderSection(t('Means'), means, 'mean', selectedMean, 'var(--weapon-color)')}
        {renderSection(t('Key evidence'), clues, 'clue', selectedKey, 'var(--evidence-color)')}

        {footer && <Box sx={{ mt: 2 }}>{footer}</Box>}

        {stamp && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-15deg)',
              zIndex: 2,
              border: '3px solid rgba(0, 0, 0, 0.35)',
              borderRadius: '4px',
              px: 1.5,
              py: 0.5,
              pointerEvents: 'none',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'var(--font-typewriter)',
                fontSize: '1.4rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'rgba(0, 0, 0, 0.4)',
                letterSpacing: '2px',
                whiteSpace: 'nowrap',
              }}
            >
              {stamp}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
