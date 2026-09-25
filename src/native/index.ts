import { isNative } from './platform';

/**
 * Hardware/gesture back: walk the router history, and leave the app when
 * there is nothing to go back to. react-router listens to popstate, so
 * history.back() is enough. iOS has no back button; this is a no-op there.
 */
const setupBackButton = async () => {
  const { App } = await import('@capacitor/app');
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
};

/**
 * Entry point for native-only setup. Safe to call on the web: it returns
 * immediately and never loads plugin code there.
 */
export const initNative = async (): Promise<void> => {
  if (!isNative()) return;
  document.documentElement.classList.add('native');
  await setupBackButton();
};
