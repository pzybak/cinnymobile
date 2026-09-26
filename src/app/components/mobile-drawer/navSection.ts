import { matchPath } from 'react-router-dom';
import {
  CREATE_PATH,
  DIRECT_PATH,
  EXPLORE_PATH,
  HOME_PATH,
  INBOX_PATH,
  SPACE_PATH,
} from '../../pages/paths';
import { getSpacePath } from '../../pages/pathUtils';

export type NavSection = {
  /** The section's own page: on phones, its room list. */
  path: string;
  /** Whether the location is that page rather than one opened from it. */
  atNav: boolean;
};

const STATIC_SECTIONS = [HOME_PATH, DIRECT_PATH, EXPLORE_PATH, INBOX_PATH];

const matches = (path: string, pathname: string, end: boolean) =>
  !!matchPath({ path, caseSensitive: true, end }, pathname);

/**
 * The nav section (Home, Direct, a space, Explore or Inbox) a location
 * belongs to, the same way BackRouteHandler resolves the back arrow.
 */
export const getNavSection = (pathname: string): NavSection | undefined => {
  const staticPath = STATIC_SECTIONS.find((path) => matches(path, pathname, false));
  if (staticPath) return { path: staticPath, atNav: matches(staticPath, pathname, true) };

  if (pathname.startsWith(CREATE_PATH)) return undefined;
  const spaceMatch = matchPath({ path: SPACE_PATH, caseSensitive: true, end: false }, pathname);
  const spaceIdOrAlias = spaceMatch?.params.spaceIdOrAlias;
  if (!spaceIdOrAlias) return undefined;
  return {
    path: getSpacePath(decodeURIComponent(spaceIdOrAlias)),
    atNav: matches(SPACE_PATH, pathname, true),
  };
};
