import Button, { type ButtonProps } from '@mui/material/Button';
import { forwardRef } from 'react';

export type StampButtonVariant = 'primary' | 'text';

export type StampButtonProps = Omit<ButtonProps, 'variant' | 'color'> & {
  variant?: StampButtonVariant;
  to?: string;
  href?: string;
};

const STAMP_RED = '#9E1B1B';

const StampButton = forwardRef<HTMLButtonElement, StampButtonProps>(
  function StampButton({ variant = 'primary', sx, children, ...rest }, ref) {
    const muiVariant = variant === 'primary' ? 'outlined' : 'text';

    const variantSx =
      variant === 'primary'
        ? {
            color: STAMP_RED,
            borderColor: STAMP_RED,
            borderWidth: 2,
            borderRadius: 0,
            bgcolor: 'transparent',
            transform: 'rotate(-1.5deg)',
            '&:hover': {
              borderColor: STAMP_RED,
              borderWidth: 2,
              bgcolor: 'rgba(158, 27, 27, 0.06)',
              transform: 'rotate(-1.5deg) translateY(-1px)',
            },
            '&.Mui-disabled': { color: STAMP_RED, opacity: 0.4, borderColor: STAMP_RED },
            '@media (prefers-reduced-motion: reduce)': {
              transform: 'none',
              '&:hover': { transform: 'none' },
            },
          }
        : {
            color: STAMP_RED,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          };

    return (
      <Button
        ref={ref}
        variant={muiVariant}
        disableElevation
        sx={{
          fontFamily: '"kingthings_trypewriter_2Rg", "IBM Plex Mono", monospace',
          fontWeight: 700,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          px: variant === 'text' ? 1 : 4,
          py: variant === 'text' ? 0.5 : 1.5,
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

export default StampButton;
