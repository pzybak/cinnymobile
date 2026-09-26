import { SystemBars, SystemBarsStyle } from '@capacitor/core';
import { isNative } from './platform';
import { handleBack } from './backButton';
import { receiveLink } from './deepLinks';
import { receiveSsoCallback, setupSsoLinks } from './sso';
import './native.css';

/**
 * Hardware/gesture back: close the newest open overlay (see backButton.ts),
 * otherwise walk the router history, and leave the app when there is
 * nothing to go back to. react-router listens to popstate, so
 * history.back() is enough. iOS has no back button; this is a no-op there.
 */
const setupBackButton = async () => {
  const { App } = await import('@capacitor/app');
  App.addListener('backButton', ({ canGoBack }) => {
    if (handleBack()) return;
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
};

/**
 * matrix.to and matrix: links opened from other apps, and SSO callbacks. A cold start from a
 * link reports it through getLaunchUrl, a running app through appUrlOpen.
 */
const setupDeepLinks = async () => {
  const { App } = await import('@capacitor/app');
  const handleUrl = (url: string) => {
    if (!receiveSsoCallback(url)) receiveLink(url);
  };
  App.addListener('appUrlOpen', ({ url }) => handleUrl(url));
  const launch = await App.getLaunchUrl();
  if (launch?.url) handleUrl(launch.url);
};

/**
 * Match the status and navigation bar icons to the app theme rather than the
 * device setting. Every dark theme adds `prism-dark` to <body> (see
 * hooks/useTheme.ts), so watch the class list instead of touching ThemeManager.
 */
const syncSystemBarsStyle = () => {
  let current: SystemBarsStyle | undefined;
  const apply = () => {
    const style = document.body.classList.contains('prism-dark')
      ? SystemBarsStyle.Dark
      : SystemBarsStyle.Light;
    if (style === current) return;
    current = style;
    SystemBars.setStyle({ style });
  };
  apply();
  new MutationObserver(apply).observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });
};

/**
 * Entry point for native-only setup. Safe to call on the web: it returns
 * immediately and never loads plugin code there.
 */
export const initNative = async (): Promise<void> => {
  if (!isNative()) return;
  document.documentElement.classList.add('native');
  syncSystemBarsStyle();
  setupSsoLinks();
  await Promise.all([setupBackButton(), setupDeepLinks()]);
};
