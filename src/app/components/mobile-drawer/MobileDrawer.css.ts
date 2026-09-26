import { ComplexStyleRule, style } from '@vanilla-extract/css';
import { color, toRem } from 'folds';

// Matches drawer.ts; kept literal so this file does not import runtime code.
const REVEALED = 'html[data-drawer-revealed]';
const SIDEBAR_WIDTH = toRem(66);
const safe = (side: string) => `var(--safe-area-inset-${side}, env(safe-area-inset-${side}, 0px))`;

/** A nav shown in its normal place in the layout. */
export const InPlace = style({
  display: 'contents',
});

// A nav kept mounted under the open page, shown only while a swipe slides
// the page aside. Fixed to where it sits on its own screen.
const behind: ComplexStyleRule = {
  position: 'fixed',
  top: `var(--drawer-top, ${safe('top')})`,
  bottom: safe('bottom'),
  display: 'flex',
  visibility: 'hidden',
  selectors: {
    [`${REVEALED} &`]: {
      visibility: 'visible',
    },
  },
};

export const BehindSidebar = style([behind, { left: safe('left') }]);

export const BehindPageNav = style([
  behind,
  {
    left: `calc(${safe('left')} + ${SIDEBAR_WIDTH})`,
    right: safe('right'),
    backgroundColor: color.Background.Container,
  },
]);

/** The open page, which slides over its nav. */
export const Panel = style({
  display: 'flex',
  flexGrow: 1,
  minWidth: 0,
  position: 'relative',
  zIndex: 1,
  backgroundColor: color.Background.Container,
});
