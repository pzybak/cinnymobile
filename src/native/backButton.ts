type BackHandler = () => void;

const handlers: BackHandler[] = [];

/**
 * Let an open overlay (a sheet or dialog) take the next Android back press
 * instead of the router. Returns a function that removes the handler.
 */
export const pushBackHandler = (handler: BackHandler): (() => void) => {
  handlers.push(handler);
  return () => {
    const index = handlers.lastIndexOf(handler);
    if (index !== -1) handlers.splice(index, 1);
  };
};

const isEditable = (el: Element | null): el is HTMLElement =>
  !!el &&
  (el.nodeName === 'INPUT' ||
    el.nodeName === 'TEXTAREA' ||
    el.getAttribute('contenteditable') === 'true');

/**
 * Close the newest open dialog, popup or menu the way Escape would. Cinny
 * renders these into #portalContainer inside a focus trap, which closes on
 * Escape and cancels the key event when it does. Cinny's traps ignore Escape
 * while a text field has focus, so blur it first.
 */
const escapeOverlay = (): boolean => {
  if (!document.getElementById('portalContainer')?.childElementCount) return false;
  if (isEditable(document.activeElement)) document.activeElement.blur();
  const evt = new KeyboardEvent('keydown', {
    key: 'Escape',
    code: 'Escape',
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(evt);
  return evt.defaultPrevented;
};

/**
 * Handle a back press inside the app: run the newest back handler, else close
 * the newest open overlay. Returns false if there was nothing to close.
 */
export const handleBack = (): boolean => {
  const handler = handlers[handlers.length - 1];
  if (handler) {
    handler();
    return true;
  }
  return escapeOverlay();
};
