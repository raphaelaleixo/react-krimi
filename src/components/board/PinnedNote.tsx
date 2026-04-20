import Box from '@mui/material/Box';
import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { forwardRef } from 'react';

export type PinnedNoteProps = ButtonBaseProps & {
  rotation?: number;
  to?: string;
  href?: string;
};

const PinnedNote = forwardRef<HTMLButtonElement, PinnedNoteProps>(
  function PinnedNote({ rotation = 0, children, sx, ...rest }, ref) {
    return (
      <ButtonBase
        ref={ref}
        disableRipple
        sx={{
          position: 'relative',
          display: 'inline-flex',
          width: 190,
          minHeight: 60,
          color: '#1C1B1B',
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 300ms ease',
          overflow: 'visible',
          '& .pn-curl': {
            position: 'absolute',
            right: '10px',
            bottom: '12px',
            width: '50%',
            height: '55%',
            maxWidth: 200,
            maxHeight: 100,
            boxShadow: '1px 4px 12px rgba(31, 31, 31, 0.6)',
            pointerEvents: 'none',
            transition: 'all 300ms ease',
          },
          '& .pn-paper': {
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            bgcolor: '#f8f6f0',
            color: '#3A7085',
            px: 2,
            py: 1.5,
            fontFamily: '"kingthings_trypewriter_2Rg", serif',
            fontSize: '1.2rem',
            fontWeight: 700,
            WebkitTextStroke: '0.3px currentColor',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
            transition: 'border-radius 300ms ease',
          },
          '& .pn-tape': {
            position: 'absolute',
            top: -14,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '4em',
            height: '1.2em',
            background: 'rgba(255, 245, 180, 0.5)',
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.15)',
            zIndex: 2,
            pointerEvents: 'none',
          },
          '&:hover': {
            transform: `rotate(${rotation}deg) translateY(-2px)`,
            '& .pn-paper': {
              borderRadius: '0 0 22% 0 / 0 0 90% 0',
            },
            '& .pn-curl': {
              right: 0,
              boxShadow: '16px 8px 18px rgba(31, 31, 31, 0.85)',
              transform: 'skew(14deg) rotate(6deg)',
            },
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            '&:hover': {
              transform: `rotate(${rotation}deg)`,
              '& .pn-paper': { borderRadius: 0 },
            },
            '& .pn-curl': { transition: 'none' },
          },
          ...sx,
        }}
        {...rest}
      >
        <Box className="pn-curl" />
        <Box className="pn-paper">
          <Box className="pn-tape" />
          {children}
        </Box>
      </ButtonBase>
    );
  },
);

export default PinnedNote;
