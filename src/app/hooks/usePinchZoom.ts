import { RefObject, useEffect, useRef } from 'react';

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 5;
const DOUBLE_TAP_ZOOM = 2;
const DOUBLE_TAP_MS = 300;
const TAP_TOLERANCE = 10;

const touchDistance = (touches: TouchList) =>
  Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

/**
 * Pinch-to-zoom and double-tap zoom for a scrolling view whose content is
 * re-rendered at each zoom level (such as PDF pages). One finger still
 * scrolls. While pinching, `previewRef` is scaled with CSS; the zoom is set
 * once the fingers lift, so the content is only re-rendered then.
 */
export const usePinchZoom = (
  scrollRef: RefObject<HTMLElement>,
  previewRef: RefObject<HTMLElement>,
  zoom: number,
  setZoom: (zoom: number) => void,
  enabled: boolean
) => {
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const setZoomRef = useRef(setZoom);
  setZoomRef.current = setZoom;

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!enabled || !scrollEl) return undefined;

    let pinch: { distance: number; ratio: number } | undefined;
    let tap: { x: number; y: number; time: number } | undefined;
    let lastTap = 0;

    const preview = (ratio?: number) => {
      const el = previewRef.current;
      if (!el) return;
      el.style.transformOrigin = 'center top';
      el.style.transform = ratio ? `scale(${ratio})` : '';
    };

    const onTouchStart = (evt: TouchEvent) => {
      if (evt.touches.length === 2) {
        tap = undefined;
        pinch = { distance: touchDistance(evt.touches), ratio: 1 };
      } else if (evt.touches.length === 1) {
        const t = evt.touches[0];
        tap = { x: t.clientX, y: t.clientY, time: evt.timeStamp };
      }
    };

    const onTouchMove = (evt: TouchEvent) => {
      const t = evt.touches[0];
      if (tap && Math.hypot(t.clientX - tap.x, t.clientY - tap.y) > TAP_TOLERANCE) tap = undefined;
      if (!pinch || evt.touches.length !== 2) return;
      if (evt.cancelable) evt.preventDefault();
      const next = zoomRef.current * (touchDistance(evt.touches) / pinch.distance);
      pinch.ratio = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)) / zoomRef.current;
      preview(pinch.ratio);
    };

    const onTouchEnd = (evt: TouchEvent) => {
      if (pinch && evt.touches.length < 2) {
        const nextZoom = Math.round(zoomRef.current * pinch.ratio * 10) / 10;
        pinch = undefined;
        preview();
        if (nextZoom !== zoomRef.current) setZoomRef.current(nextZoom);
        return;
      }
      if (!tap || evt.touches.length > 0) return;
      tap = undefined;
      if (evt.timeStamp - lastTap < DOUBLE_TAP_MS) {
        lastTap = 0;
        setZoomRef.current(zoomRef.current === 1 ? DOUBLE_TAP_ZOOM : 1);
      } else {
        lastTap = evt.timeStamp;
      }
    };

    scrollEl.addEventListener('touchstart', onTouchStart, { passive: true });
    scrollEl.addEventListener('touchmove', onTouchMove, { passive: false });
    scrollEl.addEventListener('touchend', onTouchEnd);
    scrollEl.addEventListener('touchcancel', onTouchEnd);
    return () => {
      scrollEl.removeEventListener('touchstart', onTouchStart);
      scrollEl.removeEventListener('touchmove', onTouchMove);
      scrollEl.removeEventListener('touchend', onTouchEnd);
      scrollEl.removeEventListener('touchcancel', onTouchEnd);
      preview();
    };
  }, [scrollRef, previewRef, enabled]);
};
