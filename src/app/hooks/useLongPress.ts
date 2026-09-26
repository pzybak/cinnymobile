import { TouchEvent, TouchEventHandler, useCallback, useEffect, useRef } from 'react';

const LONG_PRESS_DELAY = 500;
const MOVE_TOLERANCE = 10;

export type LongPressHandler = (evt: {
  target: EventTarget;
  clientX: number;
  clientY: number;
}) => void;

type LongPressHandlers<T> = {
  onTouchStart: TouchEventHandler<T>;
  onTouchMove: TouchEventHandler<T>;
  onTouchEnd: TouchEventHandler<T>;
  onTouchCancel: TouchEventHandler<T>;
};

/**
 * Touch long-press, for opening menus that desktop opens with right-click.
 * iOS WebKit never fires `contextmenu` for touch, so this is the only way to
 * reach those menus there. Moving the finger (scrolling) or a second finger
 * cancels the press, and the click that would follow a fired press is
 * suppressed.
 */
export const useLongPress = <T extends Element>(
  onLongPress: LongPressHandler,
  disabled?: boolean
): LongPressHandlers<T> => {
  const timerRef = useRef<number>();
  const startRef = useRef<{ x: number; y: number }>();
  const firedRef = useRef(false);

  const cancel = useCallback(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = undefined;
    startRef.current = undefined;
  }, []);

  useEffect(() => cancel, [cancel]);

  const onTouchStart = (evt: TouchEvent<T>) => {
    firedRef.current = false;
    cancel();
    if (disabled || evt.touches.length !== 1) return;

    const { clientX, clientY } = evt.touches[0];
    const { target } = evt;
    startRef.current = { x: clientX, y: clientY };
    timerRef.current = window.setTimeout(() => {
      cancel();
      firedRef.current = true;
      onLongPress({ target, clientX, clientY });
    }, LONG_PRESS_DELAY);
  };

  const onTouchMove = (evt: TouchEvent<T>) => {
    const start = startRef.current;
    if (!start) return;
    const touch = evt.touches[0];
    if (
      evt.touches.length !== 1 ||
      Math.abs(touch.clientX - start.x) > MOVE_TOLERANCE ||
      Math.abs(touch.clientY - start.y) > MOVE_TOLERANCE
    ) {
      cancel();
    }
  };

  const onTouchEnd = (evt: TouchEvent<T>) => {
    cancel();
    if (firedRef.current) {
      // Stop the browser from turning this touch into a click.
      if (evt.cancelable) evt.preventDefault();
      firedRef.current = false;
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: cancel };
};

/**
 * Whether a `contextmenu` event came from a touch long-press (Android fires
 * one) rather than a mouse right-click. By the time it fires, Android has
 * already selected the word under the finger.
 */
export const isTouchContextMenu = (evt: MouseEvent): boolean =>
  'pointerType' in evt && (evt as PointerEvent).pointerType === 'touch';
