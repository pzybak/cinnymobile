/**
 * SSO login and registration in an in-app browser tab (Custom Tabs on
 * Android, SFSafariViewController on iOS) instead of the external browser.
 *
 * Cinny sends SSO to the homeserver with redirectUrl=https://localhost/login/…,
 * an address only this app's WebView serves, so the browser has nowhere to
 * return to. We swap in a custom-scheme URL the OS routes back to the app,
 * carrying the original redirect so the loginToken lands on Cinny's own login
 * page, which already knows how to finish the login.
 */

// Keep in sync with the intent filter in AndroidManifest.xml and
// CFBundleURLSchemes in Info.plist.
const SSO_CALLBACK = 'io.github.pzybak.cinnymobile://sso';

// Spec path for SSO redirects: /login/sso/redirect[/{idpId}] (also /login/cas/redirect).
const SSO_REDIRECT_PATH = /\/_matrix\/client\/[^/]+\/login\/(sso|cas)\/redirect(\/|$)/;

const openInAppBrowser = async (url: string) => {
  const { Browser } = await import('@capacitor/browser');
  await Browser.open({ url });
};

const toNativeSsoUrl = (href: string): string | undefined => {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return undefined;
  }
  if (!SSO_REDIRECT_PATH.test(url.pathname)) return undefined;
  const redirectUrl = url.searchParams.get('redirectUrl');
  if (!redirectUrl) return undefined;

  const callback = new URL(SSO_CALLBACK);
  callback.searchParams.set('redirect', redirectUrl);
  url.searchParams.set('redirectUrl', callback.toString());
  return url.toString();
};

/** Route clicks on SSO links (Continue with SSO / identity provider buttons) to the in-app browser. */
export const setupSsoLinks = () => {
  window.addEventListener(
    'click',
    (evt) => {
      if (evt.defaultPrevented || evt.button !== 0) return;
      const anchor = (evt.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const ssoUrl = toNativeSsoUrl(anchor.href);
      if (!ssoUrl) return;
      evt.preventDefault();
      evt.stopPropagation();
      openInAppBrowser(ssoUrl);
    },
    true
  );
};

/**
 * Handle the homeserver sending the browser tab back to the app. Returns
 * true if the URL was an SSO callback.
 */
export const receiveSsoCallback = (url: string): boolean => {
  if (!url.startsWith(`${SSO_CALLBACK}?`) && url !== SSO_CALLBACK) return false;

  import('@capacitor/browser').then(({ Browser }) => Browser.close()).catch(() => undefined);

  const params = new URL(url).searchParams;
  const redirect = params.get('redirect');
  const loginToken = params.get('loginToken');
  if (!redirect || !loginToken) return true;

  // Only ever return to our own pages.
  const target = new URL(redirect, window.location.href);
  if (target.origin !== window.location.origin) return true;
  target.searchParams.set('loginToken', loginToken);
  window.location.assign(target.toString());
  return true;
};
