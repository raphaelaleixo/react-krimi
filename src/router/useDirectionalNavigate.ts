import { useCallback } from 'react';
import {
  useNavigate,
  type NavigateOptions,
  type To,
} from 'react-router-dom';
import { applyNavDirection } from './navDirection';

export function useDirectionalNavigate() {
  const navigate = useNavigate();
  return useCallback(
    (to: To, options?: NavigateOptions) => {
      applyNavDirection(to);
      navigate(to, { ...options, viewTransition: true });
    },
    [navigate],
  );
}
