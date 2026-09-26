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
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<number>();
  const [dragY, setDragY] = useState(0);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => pushBackHandler(() => onCloseRef.current()), []);

  const handleTouchStart = (evt: TouchEvent) => {
    const scrolled = (contentRef.current?.scrollTop ?? 0) > 0;
    dragStartRef.current = scrolled ? undefined : evt.touches[0].clientY;
  };

  const handleTouchMove = (evt: TouchEvent) => {
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
          <div className={css.Content} ref={contentRef}>
            {children}
          </div>
        </div>
      </FocusTrap>
    </Overlay>
  );
}
