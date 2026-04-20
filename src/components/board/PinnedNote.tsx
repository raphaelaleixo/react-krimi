import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { forwardRef } from 'react';
import Pushpin from './Pushpin';

export type PinnedNoteProps = ButtonBaseProps & {
  rotation?: number;
  pinColor?: string;
  to?: string;
  href?: string;
};

const PinnedNote = forwardRef<HTMLButtonElement, PinnedNoteProps>(
  function PinnedNote(
    { rotation = 0, pinColor = '#3A7085', children, sx, ...rest },
    ref,
  ) {
    return (
      <ButtonBase
        ref={ref}
        sx={{
          position: 'relative',
          display: 'inline-flex',
          width: 150,
          minHeight: 60,
          px: 2,
          py: 1.5,
          bgcolor: '#f8f6f0',
          color: '#1C1B1B',
          fontFamily: '"kingthings_trypewriter_2Rg", serif',
          fontSize: '0.95rem',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
          transform: `rotate(${rotation}deg)`,
          transition:
            'transform 300ms ease, box-shadow 300ms ease, border-radius 300ms ease',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            right: '10px',
            width: '50%',
            height: '55%',
            maxWidth: 200,
            maxHeight: 100,
            transition: 'all 300ms ease',
            pointerEvents: 'none',
            zIndex: -1,
          },
          '&::before': {
            top: '12px',
            boxShadow: '1px -4px 12px rgba(31, 31, 31, 0.6)',
          },
          '&::after': {
            bottom: '12px',
            boxShadow: '1px 4px 12px rgba(31, 31, 31, 0.6)',
          },
          '&:hover': {
            transform: `rotate(${rotation}deg) translateY(-2px)`,
            borderRadius: '0 3% 3% 0 / 0% 50% 50% 0',
            '&::before': {
              right: 0,
              boxShadow: '10px -4px 12px rgba(31, 31, 31, 0.8)',
              transform: 'skew(-8deg) rotate(-3deg)',
            },
            '&::after': {
              right: 0,
              boxShadow: '10px 4px 12px rgba(31, 31, 31, 0.8)',
              transform: 'skew(8deg) rotate(3deg)',
            },
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            '&:hover': {
              transform: `rotate(${rotation}deg)`,
              borderRadius: 0,
            },
            '&::before, &::after': { transition: 'none' },
          },
          ...sx,
        }}
        {...rest}
      >
        <Pushpin color={pinColor} />
        {children}
      </ButtonBase>
    );
  },
);

export default PinnedNote;
