import React, { ReactNode } from 'react';
import { useMatch } from 'react-router-dom';
import { ScreenSize, useScreenSizeContext } from '../hooks/useScreenSize';
import { DIRECT_PATH, EXPLORE_PATH, HOME_PATH, INBOX_PATH, SPACE_PATH } from './paths';
import { MobileDrawerNav } from '../components/mobile-drawer';

type MobileFriendlyClientNavProps = {
  children: ReactNode;
};
export function MobileFriendlyClientNav({ children }: MobileFriendlyClientNavProps) {
  const screenSize = useScreenSizeContext();
  const homeMatch = useMatch({ path: HOME_PATH, caseSensitive: true, end: true });
  const directMatch = useMatch({ path: DIRECT_PATH, caseSensitive: true, end: true });
  const spaceMatch = useMatch({ path: SPACE_PATH, caseSensitive: true, end: true });
  const exploreMatch = useMatch({ path: EXPLORE_PATH, caseSensitive: true, end: true });
  const inboxMatch = useMatch({ path: INBOX_PATH, caseSensitive: true, end: true });

  if (screenSize === ScreenSize.Mobile) {
    // Kept mounted under the open page for the swipe drawer.
    return (
      <MobileDrawerNav
        slot="sidebar"
        inPlace={!!(homeMatch || directMatch || spaceMatch || exploreMatch || inboxMatch)}
      >
        {children}
      </MobileDrawerNav>
    );
  }

  return children;
}

type MobileFriendlyPageNavProps = {
  path: string;
  children: ReactNode;
};
export function MobileFriendlyPageNav({ path, children }: MobileFriendlyPageNavProps) {
  const screenSize = useScreenSizeContext();
  const exactPath = useMatch({
    path,
    caseSensitive: true,
    end: true,
  });

  if (screenSize === ScreenSize.Mobile) {
    // Kept mounted under the open page for the swipe drawer.
    return (
      <MobileDrawerNav slot="page" inPlace={!!exactPath}>
        {children}
      </MobileDrawerNav>
    );
  }

  return children;
}
