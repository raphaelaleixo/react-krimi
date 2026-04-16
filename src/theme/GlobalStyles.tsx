import { GlobalStyles as MuiGlobalStyles } from '@mui/material';
import bgImage from '../assets/bg.png';
import woff2Font from '../assets/kingthings_trypewriter_2-webfont.woff2';
import woffFont from '../assets/kingthings_trypewriter_2-webfont.woff';

const clipPathPoints = Array.from({ length: 21 }, (_, i) => {
  const x = (i * 5);
  const y = i % 2 === 0 ? '0%' : '100%';
  return `${x}% ${y}`;
}).join(', ');

export default function GlobalStyles() {
  return (
    <MuiGlobalStyles
      styles={{
        '@font-face': {
          fontFamily: 'kingthings_trypewriter_2Rg',
          src: `url("${woff2Font}") format("woff2"), url("${woffFont}") format("woff")`,
          fontWeight: 'normal',
          fontStyle: 'normal',
        },
        body: {
          margin: 0,
          background: `url("${bgImage}") no-repeat fixed top center !important`,
          backgroundSize: 'cover',
          fontFamily: '"IBM Plex Mono", monospace',
          color: '#5f6c7b',
        },
        code: {
          letterSpacing: '1px',
          fontFamily: '"kingthings_trypewriter_2Rg", serif',
        },
        '.MuiCardContent-root': {
          position: 'relative',
          '&::before, &::after': {
            content: '""',
            height: '2px',
            position: 'absolute',
            left: 0,
            right: 0,
            boxShadow: '0 3px 5px rgba(0, 0, 0, 0.05)',
            WebkitClipPath: `polygon(${clipPathPoints})`,
            clipPath: `polygon(${clipPathPoints})`,
          },
          '&::before': {
            backgroundColor: '#fff',
            top: 0,
          },
          '&::after': {
            height: '4px',
            backgroundColor: '#fff',
            bottom: '-3px',
          },
        },
      }}
    />
  );
}
