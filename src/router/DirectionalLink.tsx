import { forwardRef, type MouseEvent } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { applyNavDirection } from './navDirection';

export const DirectionalLink = forwardRef<HTMLAnchorElement, LinkProps>(
  function DirectionalLink({ to, onClick, ...props }, ref) {
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) applyNavDirection(to);
    };
    return (
      <Link ref={ref} to={to} viewTransition onClick={handleClick} {...props} />
    );
  },
);
