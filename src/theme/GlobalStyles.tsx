import { Global, css } from '@emotion/react';

const clipPathPoints = Array.from({ length: 21 }, (_, i) => {
  const x = i * 5;
  const y = i % 2 === 0 ? '0%' : '100%';
  return `${x}% ${y}`;
}).join(', ');

const CORK_TEXTURE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3' stitchTiles='stitch' seed='7'/><feColorMatrix type='matrix' values='0 0 0 0.22 0.14  0 0 0 0.2 0.13  0 0 0 0.18 0.12  0 0 0 1.4 -0.15'/></filter><rect width='100%' height='100%' filter='url(%23c)'/></svg>\")";

const VIGNETTE =
  'radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)';

const FOOTER_FADE =
  'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 22%)';

export default function GlobalStyles() {
  return (
    <Global
      styles={css`
        :root {
          --font-typewriter: 'Special Elite', monospace;
          --font-script: 'Story Script', cursive;
        }

        body {
          margin: 0;
          background-color: #0a0a0b;
          background-image: ${FOOTER_FADE}, ${VIGNETTE}, ${CORK_TEXTURE};
          background-repeat: no-repeat, no-repeat, repeat;
          background-size: 100% 100%, 100% 100%, 240px 240px;
          background-position: top center, center center, top left;
          background-attachment: fixed, fixed, fixed;
          font-family: var(--font-typewriter);
          color: #f5efe3;
        }

        code {
          letter-spacing: 1px;
          font-family: var(--font-typewriter);
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

        #root {
          view-transition-name: page-content;
        }

        ::view-transition-group(root),
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none !important;
        }

        ::view-transition-old(page-content),
        ::view-transition-new(page-content) {
          animation-duration: 320ms;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          animation-fill-mode: both;
        }

        html[data-nav-direction='forward']::view-transition-old(page-content) {
          animation-name: krimi-slide-out-left;
        }
        html[data-nav-direction='forward']::view-transition-new(page-content) {
          animation-name: krimi-slide-in-right;
        }
        html[data-nav-direction='back']::view-transition-old(page-content) {
          animation-name: krimi-slide-out-right;
        }
        html[data-nav-direction='back']::view-transition-new(page-content) {
          animation-name: krimi-slide-in-left;
        }

        @keyframes krimi-slide-in-right {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes krimi-slide-out-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-100%); }
        }
        @keyframes krimi-slide-in-left {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes krimi-slide-out-right {
          from { transform: translateX(0); }
          to   { transform: translateX(100%); }
        }

        @media (prefers-reduced-motion: reduce) {
          ::view-transition-old(page-content),
          ::view-transition-new(page-content) {
            animation: none !important;
          }
        }
      `}
    />
  );
}
