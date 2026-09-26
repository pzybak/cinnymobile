import { globalStyle, style } from '@vanilla-extract/css';
import { DefaultReset, color, config, toRem } from 'folds';

export const MessageBase = style({
  position: 'relative',
});
export const MessageBaseBubbleCollapsed = style({
  paddingTop: 0,
});

export const MessageOptionsBase = style([
  DefaultReset,
  {
    position: 'absolute',
    top: toRem(-30),
    right: 0,
    zIndex: 1,
  },
]);
export const MessageOptionsBar = style([
  DefaultReset,
  {
    padding: config.space.S100,
  },
]);

export const BubbleAvatarBase = style({
  paddingTop: 0,
});

export const MessageAvatar = style({
  cursor: 'pointer',
});

export const MessageQuickReaction = style({
  minWidth: toRem(32),
});

export const MessageMenuGroup = style({
  padding: config.space.S100,
});

export const MessageMenuItemText = style({
  flexGrow: 1,
});

// The message menu inside a touch bottom sheet: grouped cards with
// full-width, finger-sized rows, reusing the desktop menu's items.
export const MessageMenuSheet = style({
  display: 'flex',
  flexDirection: 'column',
  gap: config.space.S300,
});
globalStyle(`${MessageMenuSheet} ${MessageMenuGroup}`, {
  gap: 0,
  borderRadius: config.radii.R400,
  backgroundColor: color.SurfaceVariant.Container,
});
// Rows share their group's card. Plain backgrounds also keep a row from
// staying highlighted after a tap (touch leaves :hover set).
globalStyle(`${MessageMenuSheet} ${MessageMenuGroup} > button`, {
  height: 'auto',
  minHeight: toRem(52),
  backgroundColor: 'transparent',
});
globalStyle(`${MessageMenuSheet} ${MessageMenuGroup} > button:active`, {
  backgroundColor: color.SurfaceVariant.ContainerActive,
});
globalStyle(`${MessageMenuSheet} ${MessageMenuItemText}`, {
  fontSize: toRem(16),
});
globalStyle(`${MessageMenuSheet} ${MessageQuickReaction}`, {
  minWidth: toRem(48),
  height: toRem(48),
});

export const ReactionsContainer = style({
  selectors: {
    '&:empty': {
      display: 'none',
    },
  },
});

export const ReactionsTooltipText = style({
  wordBreak: 'break-word',
});
