import React, { ReactNode, TouchEvent, useEffect, useRef, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { Overlay, OverlayBackdrop } from 'folds';
import { stopPropagation } from '../../utils/keyboard';
import { pushBackHandler } from '../../../native/backButton';
import * as css from './BottomSheet.css';

// How far the sheet must be dragged down before letting go closes it.
const DISMISS_DISTANCE = 80;

type BottomSheetProps = {
  onClose: () => void;
  children: ReactNode;
};

/**
 * A full-width panel that slides up from the bottom of the screen, for menus
 * opened by touch. Closes on a tap outside, Escape, Android back, or a drag
 * down while its content is scrolled to the top.
 */
export function BottomSheet({ onClose, children }: BottomSheetProps) {
  const dragStartRef = useRef<number>();
  const [dragY, setDragY] = useState(0);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => pushBackHandler(() => onCloseRef.current()), []);

  const handleTouchStart = (evt: TouchEvent<HTMLDivElement>) => {
    // Pulling down in a scrolled list (the sheet or a list inside it, such as
    // the emoji grid) scrolls it back up instead of dragging the sheet.
    let el = evt.target instanceof Element ? evt.target : null;
    while (el && el !== evt.currentTarget) {
      if (el.scrollTop > 0) {
        dragStartRef.current = undefined;
        return;
      }
      el = el.parentElement;
    }
    dragStartRef.current = evt.touches[0].clientY;
  };

  const handleTouchMove = (evt: TouchEvent<HTMLDivElement>) => {
    if (dragStartRef.current === undefined) return;
    setDragY(Math.max(0, evt.touches[0].clientY - dragStartRef.current));
  };

  const handleTouchEnd = () => {
    if (dragStartRef.current === undefined) return;
    dragStartRef.current = undefined;
    if (dragY > DISMISS_DISTANCE) onClose();
    else setDragY(0);
  };

  return (
    <Overlay open backdrop={<OverlayBackdrop />}>
      <FocusTrap
        focusTrapOptions={{
          initialFocus: false,
          onDeactivate: onClose,
          clickOutsideDeactivates: true,
          escapeDeactivates: stopPropagation,
        }}
      >
        <div
          className={css.Sheet}
          role="dialog"
          aria-modal="true"
          data-dragging={dragStartRef.current !== undefined && dragY > 0}
          style={dragY > 0 ? { transform: `translateY(${dragY}px)` } : undefined}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div className={css.Handle} />
          <div className={css.Content}>{children}</div>
        </div>
      </FocusTrap>
    </Overlay>
  );
}
