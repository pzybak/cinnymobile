/**
 * Position of the phone drawer: how far the open page (a room, the lobby,
 * search...) is slid right to show its section's nav underneath. Swipes
 * update it every frame, so it is applied to the DOM directly rather than
 * through React state.
 */

const REVEALED_ATTR = 'data-drawer-revealed';
const SLIDE_MS = 200;

let panel: HTMLElement | null = null;
let offset = 0;

const apply = (animate: boolean) => {
  const root = document.documentElement;
  root.toggleAttribute(REVEALED_ATTR, offset > 0);
  if (!panel) return;
  // Line the nav up with the page, which sits below banners such as
  // "Connecting...".
  if (offset > 0) root.style.setProperty('--drawer-top', `${panel.getBoundingClientRect().top}px`);
  panel.style.transition = animate ? `transform ${SLIDE_MS}ms ease-out` : '';
  panel.style.transform = offset > 0 ? `translateX(${offset}px)` : '';
  panel.style.boxShadow = offset > 0 ? '-4px 0 24px rgba(0, 0, 0, 0.35)' : '';
};

export const drawerWidth = (): number => document.documentElement.clientWidth;

export const getDrawerOffset = (): number => offset;

/** Registers the element that slides; called when the page mounts. */
export const setDrawerPanel = (el: HTMLElement | null) => {
  panel = el;
  apply(false);
};

/** Moves the page to `x` px from the left, following a finger. */
export const setDrawerOffset = (x: number) => {
  offset = Math.max(0, Math.min(drawerWidth(), x));
  apply(false);
};

/** Slides the page to `x` px from the left, then calls `done`. */
export const slideDrawerTo = (x: number, done?: () => void) => {
  offset = Math.max(0, Math.min(drawerWidth(), x));
  apply(true);
  window.setTimeout(() => done?.(), SLIDE_MS);
};

/** Shows the nav underneath without moving the page (before it mounts). */
export const revealDrawer = () => {
  document.documentElement.setAttribute(REVEALED_ATTR, '');
};

export const resetDrawer = () => {
  offset = 0;
  apply(false);
};
