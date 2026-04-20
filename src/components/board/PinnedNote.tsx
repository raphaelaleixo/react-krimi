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
          transition: 'transform 180ms ease, box-shadow 180ms ease',
          '&:hover': {
            transform: `rotate(${rotation}deg) translateY(-2px)`,
            boxShadow: '0 6px 14px rgba(0,0,0,0.55)',
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            '&:hover': { transform: `rotate(${rotation}deg)` },
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
