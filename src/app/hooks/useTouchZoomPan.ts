import { Dispatch, PointerEvent, SetStateAction, useRef, useState } from 'react';
import { Pan } from './usePan';

const MAX_ZOOM = 5;
const DOUBLE_TAP_ZOOM = 2;
const DOUBLE_TAP_MS = 300;
const TAP_TOLERANCE = 10;

type Point = { x: number; y: number };

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Touch gestures for a zoomable image, whose transform is
 * `scale(zoom) translate(pan)`: one finger drags it while zoomed in, two
 * fingers pinch to zoom, and a double-tap toggles between 1x and 2x. Mouse
 * input is left to usePan and the zoom buttons. The element needs
 * `touch-action: none` so the browser does not scroll or zoom the page.
 */
export const useTouchZoomPan = (
  zoom: number,
  setZoom: (zoom: number) => void,
  setPan: Dispatch<SetStateAction<Pan>>
) => {
  const pointersRef = useRef(new Map<number, Point>());
  const pinchRef = useRef<{ distance: number; zoom: number }>();
  const tapRef = useRef<{ start: Point; time: number; moved: boolean }>();
  const lastTapRef = useRef(0);
  const [gesturing, setGesturing] = useState(false);

  const onPointerDown = (evt: PointerEvent<HTMLElement>) => {
    if (evt.pointerType !== 'touch') return;
    evt.currentTarget.setPointerCapture(evt.pointerId);
    const point = { x: evt.clientX, y: evt.clientY };
    pointersRef.current.set(evt.pointerId, point);
    setGesturing(true);

    if (pointersRef.current.size === 1) {
      tapRef.current = { start: point, time: evt.timeStamp, moved: false };
    } else {
      tapRef.current = undefined;
      const [a, b] = [...pointersRef.current.values()];
      pinchRef.current = { distance: distance(a, b), zoom };
    }
  };

  const onPointerMove = (evt: PointerEvent<HTMLElement>) => {
    const prev = pointersRef.current.get(evt.pointerId);
    if (!prev) return;
    const point = { x: evt.clientX, y: evt.clientY };
    pointersRef.current.set(evt.pointerId, point);

    const tap = tapRef.current;
    if (tap && distance(tap.start, point) > TAP_TOLERANCE) tap.moved = true;

    const pinch = pinchRef.current;
    if (pinch && pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      const next = (pinch.zoom * distance(a, b)) / pinch.distance;
      setZoom(Math.min(MAX_ZOOM, Math.max(Math.min(1, pinch.zoom), next)));
      return;
    }
    if (pointersRef.current.size === 1 && zoom !== 1) {
      // Translate is applied inside the scale, so divide to follow the finger.
      setPan((p) => ({
        translateX: p.translateX + (point.x - prev.x) / zoom,
        translateY: p.translateY + (point.y - prev.y) / zoom,
      }));
    }
  };

  const onPointerUp = (evt: PointerEvent<HTMLElement>) => {
    if (!pointersRef.current.delete(evt.pointerId)) return;
    if (pointersRef.current.size < 2) pinchRef.current = undefined;
    if (pointersRef.current.size > 0) return;
    setGesturing(false);

    const tap = tapRef.current;
    tapRef.current = undefined;
    if (evt.type !== 'pointerup' || !tap || tap.moved) return;
    if (evt.timeStamp - lastTapRef.current < DOUBLE_TAP_MS) {
      lastTapRef.current = 0;
      setZoom(zoom === 1 ? DOUBLE_TAP_ZOOM : 1);
    } else {
      lastTapRef.current = evt.timeStamp;
    }
  };

  return {
    gesturing,
    touchZoomPanProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
};
