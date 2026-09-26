import React, { ReactNode, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ScreenSize, useScreenSizeContext } from '../../hooks/useScreenSize';
import { NavSection, getNavSection } from './navSection';
import {
  drawerWidth,
  getDrawerOffset,
  resetDrawer,
  revealDrawer,
  setDrawerOffset,
  setDrawerPanel,
  slideDrawerTo,
} from './drawer';
import * as css from './MobileDrawer.css';

// Movement before a touch counts as a swipe, and how clearly sideways it
// must be (vertical moves scroll the page instead).
const DECIDE_DISTANCE = 10;
const HORIZONTAL_RATIO = 1.2;
// Letting go past this share of the screen, or flinging faster than this
// (px/ms), completes the slide; otherwise it springs back.
const COMMIT_FRACTION = 0.35;
const FLING_VELOCITY = 0.4;

type Swipe = {
  /**
   * reveal: slide the open page right to show its section's nav.
   * return: from the nav, bring back the page last opened from it.
   */
  mode: 'reveal' | 'return';
  section: NavSection;
  returnTo?: string;
  startX: number;
  startY: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  dragging: boolean;
};

const isHorizontallyScrollable = (el: Element): boolean => {
  if (el.scrollWidth <= el.clientWidth + 1) return false;
  const { overflowX } = window.getComputedStyle(el);
  return overflowX === 'auto' || overflowX === 'scroll';
};

/** Swipes are left alone in overlays, text fields and sideways scrollers. */
const canSwipeFrom = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  const portal = document.getElementById('portalContainer');
  if (portal && (portal.childElementCount > 0 || portal.contains(target))) return false;
  if (target.closest('input, textarea, [contenteditable="true"]')) return false;
  for (let el: Element | null = target; el && el !== document.body; el = el.parentElement) {
    if (isHorizontallyScrollable(el)) return false;
  }
  return true;
};

/**
 * Discord-style navigation on phones, where a section's nav (the room list)
 * and the page opened from it (a room) are separate screens. Swiping right
 * on the page slides it aside to reveal the nav, and swiping left on the
 * nav slides the last page back. Mount once inside the router.
 */
export function MobileDrawerGestures() {
  const screenSize = useScreenSizeContext();
  const location = useLocation();
  const navigate = useNavigate();

  const locationRef = useRef(location);
  locationRef.current = location;
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const lastPagesRef = useRef(new Map<string, string>());
  const swipeRef = useRef<Swipe>();
  const slidingRef = useRef(false);

  // Remember the page last opened from each section, to swipe back to.
  useEffect(() => {
    const section = getNavSection(location.pathname);
    if (section && !section.atNav) {
      lastPagesRef.current.set(
        section.path,
        `${location.pathname}${location.search}${location.hash}`
      );
    }
    // A completed slide (or any other navigation) leaves the drawer at rest,
    // once the new screen has rendered in place of the old one.
    if (!swipeRef.current && !slidingRef.current) resetDrawer();
  }, [location]);

  useEffect(() => {
    if (screenSize !== ScreenSize.Mobile) return undefined;

    const finish = (x: number, done?: () => void) => {
      slidingRef.current = true;
      slideDrawerTo(x, () => {
        slidingRef.current = false;
        done?.();
      });
    };

    const onTouchStart = (evt: TouchEvent) => {
      swipeRef.current = undefined;
      if (evt.touches.length !== 1 || slidingRef.current || !canSwipeFrom(evt.target)) return;
      const section = getNavSection(locationRef.current.pathname);
      if (!section) return;
      const returnTo = section.atNav ? lastPagesRef.current.get(section.path) : undefined;
      if (section.atNav && !returnTo) return;

      const touch = evt.touches[0];
      swipeRef.current = {
        mode: section.atNav ? 'return' : 'reveal',
        section,
        returnTo,
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
        lastTime: evt.timeStamp,
        velocity: 0,
        dragging: false,
      };
    };

    const onTouchMove = (evt: TouchEvent) => {
      const swipe = swipeRef.current;
      if (!swipe) return;
      const touch = evt.touches[0];
      const dx = touch.clientX - swipe.startX;
      const dy = touch.clientY - swipe.startY;

      if (!swipe.dragging) {
        if (Math.abs(dx) < DECIDE_DISTANCE && Math.abs(dy) < DECIDE_DISTANCE) return;
        const sideways = Math.abs(dx) > Math.abs(dy) * HORIZONTAL_RATIO;
        const towardNav = swipe.mode === 'reveal' ? dx > 0 : dx < 0;
        // Once the browser has started scrolling, moves can't be taken over.
        if (!sideways || !towardNav || !evt.cancelable) {
          swipeRef.current = undefined;
          return;
        }
        swipe.dragging = true;
        if (swipe.mode === 'return' && swipe.returnTo) {
          // Open the page off to the right; the finger then pulls it in.
          revealDrawer();
          setDrawerOffset(drawerWidth());
          navigateRef.current(swipe.returnTo);
        }
      }

      evt.preventDefault();
      const elapsed = evt.timeStamp - swipe.lastTime;
      if (elapsed > 0) swipe.velocity = (touch.clientX - swipe.lastX) / elapsed;
      swipe.lastX = touch.clientX;
      swipe.lastTime = evt.timeStamp;
      setDrawerOffset(swipe.mode === 'reveal' ? dx : drawerWidth() + dx);
    };

    const onTouchEnd = () => {
      const swipe = swipeRef.current;
      swipeRef.current = undefined;
      if (!swipe?.dragging) return;

      const width = drawerWidth();
      const x = getDrawerOffset();
      const { velocity } = swipe;
      if (swipe.mode === 'reveal') {
        const open =
          velocity > FLING_VELOCITY || (x > width * COMMIT_FRACTION && velocity > -FLING_VELOCITY);
        if (open) finish(width, () => navigateRef.current(swipe.section.path));
        else finish(0, resetDrawer);
      } else {
        const back =
          velocity < -FLING_VELOCITY ||
          (x < width * (1 - COMMIT_FRACTION) && velocity < FLING_VELOCITY);
        if (back) finish(0, resetDrawer);
        else finish(width, () => navigateRef.current(-1));
      }
    };

    document.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    document.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
    document.addEventListener('touchend', onTouchEnd, true);
    document.addEventListener('touchcancel', onTouchEnd, true);
    return () => {
      document.removeEventListener('touchstart', onTouchStart, true);
      document.removeEventListener('touchmove', onTouchMove, true);
      document.removeEventListener('touchend', onTouchEnd, true);
      document.removeEventListener('touchcancel', onTouchEnd, true);
      resetDrawer();
    };
  }, [screenSize]);

  return null;
}

/**
 * Wraps a page opened from a nav section so the drawer can slide it. On a
 * phone's nav screen, or on larger screens, it renders the page as is.
 */
export function MobileDrawerPanel({ children }: { children: ReactNode }) {
  const screenSize = useScreenSizeContext();
  const section = getNavSection(useLocation().pathname);

  if (screenSize !== ScreenSize.Mobile || !section || section.atNav) {
    // A fragment rather than a wrapper, so these layouts are unchanged.
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }
  return (
    <div ref={setDrawerPanel} className={css.Panel}>
      {children}
    </div>
  );
}

type MobileDrawerNavProps = {
  /** Whether this nav is the current screen (else it waits under the page). */
  inPlace: boolean;
  /** Which fixed slot the nav takes under the page. */
  slot: 'sidebar' | 'page';
  children: ReactNode;
};

/**
 * On phones, keeps a nav mounted under the open page so a swipe can reveal
 * it, and so a swipe that starts on it survives switching to the page.
 */
export function MobileDrawerNav({ inPlace, slot, children }: MobileDrawerNavProps) {
  let className = css.InPlace;
  if (!inPlace) className = slot === 'sidebar' ? css.BehindSidebar : css.BehindPageNav;
  return <div className={className}>{children}</div>;
}
