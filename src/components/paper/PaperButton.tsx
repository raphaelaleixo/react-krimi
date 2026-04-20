import Button, { type ButtonProps } from '@mui/material/Button';
import { forwardRef } from 'react';

export type PaperButtonVariant = 'primary' | 'secondary' | 'text';

export type PaperButtonProps = Omit<ButtonProps, 'variant' | 'color'> & {
  variant?: PaperButtonVariant;
  to?: string;
  href?: string;
};

const INK = '#094067';
const INK_SOFT = 'rgba(9, 64, 103, 0.15)';

const PaperButton = forwardRef<HTMLButtonElement, PaperButtonProps>(
  function PaperButton({ variant = 'primary', sx, children, ...rest }, ref) {
    const muiVariant =
      variant === 'primary'
        ? 'contained'
        : variant === 'secondary'
        ? 'outlined'
        : 'text';

    const variantSx =
      variant === 'primary'
        ? {
            bgcolor: INK,
            color: '#f5efe3',
            borderRadius: 0,
            boxShadow: `2px 3px 0 ${INK_SOFT}`,
            transform: 'rotate(-0.5deg)',
            '&:hover': {
              bgcolor: INK,
              boxShadow: `3px 4px 0 ${INK_SOFT}`,
              transform: 'rotate(-0.5deg) translateY(-1px)',
            },
            '@media (prefers-reduced-motion: reduce)': {
              transform: 'none',
              '&:hover': { transform: 'none' },
            },
          }
        : variant === 'secondary'
        ? {
            color: INK,
            borderColor: INK,
            borderWidth: 2,
            borderRadius: 0,
            bgcolor: 'transparent',
            boxShadow: `1px 2px 0 ${INK_SOFT}`,
            '&:hover': { borderColor: INK, borderWidth: 2, bgcolor: 'rgba(9, 64, 103, 0.04)' },
          }
        : {
            color: INK,
            textTransform: 'none',
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          };

    return (
      <Button
        ref={ref}
        variant={muiVariant}
        disableElevation
        sx={{
          fontFamily: '"kingthings_trypewriter_2Rg", "IBM Plex Mono", monospace',
          fontWeight: 400,
          letterSpacing: 0,
          px: variant === 'text' ? 1 : 3,
          py: variant === 'text' ? 0.5 : 1.25,
          ...variantSx,
          ...sx,
        }}
        {...rest}
      >
        {children}
      </Button>
    );
  },
);

export default PaperButton;
