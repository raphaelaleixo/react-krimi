import { Global, css } from '@emotion/react';
import bgImage from '../assets/bg.png';
import woff2Font from '../assets/kingthings_trypewriter_2-webfont.woff2';
import woffFont from '../assets/kingthings_trypewriter_2-webfont.woff';

const clipPathPoints = Array.from({ length: 21 }, (_, i) => {
  const x = i * 5;
  const y = i % 2 === 0 ? '0%' : '100%';
  return `${x}% ${y}`;
}).join(', ');

export default function GlobalStyles() {
  return (
    <Global
      styles={css`
        @font-face {
          font-family: 'kingthings_trypewriter_2Rg';
          src: url('${woff2Font}') format('woff2'),
               url('${woffFont}') format('woff');
          font-weight: normal;
          font-style: normal;
        }

        body {
          margin: 0;
          background: url('${bgImage}') no-repeat fixed top center !important;
          background-size: cover;
          font-family: 'IBM Plex Mono', monospace;
          color: #5f6c7b;
        }

        code {
          letter-spacing: 1px;
          font-family: 'kingthings_trypewriter_2Rg', serif;
        }

        .MuiCardContent-root {
          position: relative;
        }

        .MuiCardContent-root::before,
        .MuiCardContent-root::after {
          content: '';
          height: 2px;
          position: absolute;
          left: 0;
          right: 0;
          box-shadow: 0 3px 5px rgba(0, 0, 0, 0.05);
          -webkit-clip-path: polygon(${clipPathPoints});
          clip-path: polygon(${clipPathPoints});
        }

        .MuiCardContent-root::before {
          background-color: #fff;
          top: 0;
        }

        .MuiCardContent-root::after {
          height: 4px;
          background-color: #fff;
          bottom: -3px;
        }
      `}
    />
  );
}
