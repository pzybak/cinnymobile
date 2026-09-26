import { useSyncExternalStore } from 'react';

const query = window.matchMedia('(hover: none) and (pointer: coarse)');

const subscribe = (onChange: () => void) => {
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

const getSnapshot = () => query.matches;

/**
 * Whether the primary input is a finger (phones, tablets) rather than a mouse,
 * so hover-only UI is unreachable and menus should be sized for touch.
 */
export const useTouchInput = (): boolean => useSyncExternalStore(subscribe, getSnapshot);
