import Button, { type ButtonProps } from '@mui/material/Button';
import { forwardRef, useMemo } from 'react';

export type StampButtonVariant = 'primary' | 'text';

export type StampButtonProps = Omit<ButtonProps, 'variant' | 'color'> & {
  variant?: StampButtonVariant;
  to?: string;
  href?: string;
};

const STAMP_RED = '#9E1B1B';

function generateDistressedStamp() {
  const points: string[] = [];
  const steps = 80;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const bite = Math.random() < 0.3 ? Math.random() * 8 : 0;
    const r = 50 - bite;
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  return `polygon(${points.join(', ')})`;
}

const StampButton = forwardRef<HTMLButtonElement, StampButtonProps>(
  function StampButton({ variant = 'primary', sx, children, ...rest }, ref) {
    const muiVariant = variant === 'primary' ? 'outlined' : 'text';
    const distressed = useMemo(() => generateDistressedStamp(), []);

    const variantSx =
      variant === 'primary'
        ? {
            color: STAMP_RED,
            borderColor: STAMP_RED,
            borderWidth: 4,
            borderRadius: 999,
            bgcolor: 'transparent',
            clipPath: distressed,
            transform: 'rotate(-1.5deg)',
            '&:hover': {
              borderColor: STAMP_RED,
              borderWidth: 4,
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
          px: variant === 'text' ? 1 : 6,
          py: variant === 'text' ? 0.5 : 2,
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
