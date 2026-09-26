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

/** Run the newest back handler. Returns false if there is none. */
export const handleBack = (): boolean => {
  const handler = handlers[handlers.length - 1];
  if (!handler) return false;
  handler();
  return true;
};
