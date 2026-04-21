import type { To } from 'react-router-dom';

function pathFromTo(to: To): string {
  return typeof to === 'string' ? to : (to.pathname ?? '');
}

export function applyNavDirection(to: To): void {
  const direction = pathFromTo(to) === '/' ? 'back' : 'forward';
  document.documentElement.dataset.navDirection = direction;
}
