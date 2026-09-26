import { testMatrixTo } from '../app/plugins/matrix-to';
import { tryDecodeURIComponent } from '../app/utils/dom';

type LinkListener = (matrixToUrl: string) => void;

// Links can arrive before the client has loaded (a cold start from a link,
// or while logged out), so keep the latest one until a handler takes it.
let pending: string | undefined;
const listeners = new Set<LinkListener>();

// matrix: URIs (MSC2312), e.g. matrix:r/room:example.org,
// matrix:u/alice:example.org, matrix:roomid/abc:example.org/e/event?via=x
const MATRIX_URI = /^matrix:(?:\/\/)?(u|r|roomid)\/([^/?]+)(?:\/e\/([^/?]+))?(\?.*)?$/;
const SIGILS: Record<string, string> = { u: '@', r: '#', roomid: '!' };

/** Normalise matrix.to and matrix: links to a decoded matrix.to URL. */
export const toMatrixToUrl = (url: string): string | undefined => {
  const decoded = tryDecodeURIComponent(url);
  if (testMatrixTo(decoded)) return decoded;

  const match = url.match(MATRIX_URI);
  if (!match) return undefined;
  const [, kind, id, eventId, query] = match;
  let fragment = SIGILS[kind] + tryDecodeURIComponent(id);
  if (eventId) fragment += `/$${tryDecodeURIComponent(eventId)}`;
  // matrix.to user links take no query (via/action only apply to rooms).
  if (query && kind !== 'u') fragment += query;
  return `https://matrix.to/#/${fragment}`;
};

export const receiveLink = (url: string) => {
  const matrixToUrl = toMatrixToUrl(url);
  if (!matrixToUrl) return;
  if (listeners.size === 0) {
    pending = matrixToUrl;
    return;
  }
  listeners.forEach((listener) => listener(matrixToUrl));
};

/** Subscribe to incoming links; any link that arrived earlier is delivered at once. */
export const onLink = (listener: LinkListener): (() => void) => {
  listeners.add(listener);
  if (pending) {
    const url = pending;
    pending = undefined;
    listener(url);
  }
  return () => {
    listeners.delete(listener);
  };
};
