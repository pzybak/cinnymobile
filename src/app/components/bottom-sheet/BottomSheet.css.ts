import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { DefaultReset, color, config, toRem } from 'folds';

const slideUp = keyframes({
  from: { transform: 'translateY(100%)' },
  to: { transform: 'translateY(0)' },
});

export const Sheet = style([
  DefaultReset,
  {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    margin: '0 auto',
    width: '100%',
    maxWidth: toRem(640),
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: color.Background.Container,
    color: color.Background.OnContainer,
    borderRadius: `${config.radii.R500} ${config.radii.R500} 0 0`,
    boxShadow: config.shadow.E200,
    paddingBottom: 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))',
    animation: `${slideUp} 180ms ease-out`,
    transition: 'transform 150ms ease-out',
    selectors: {
      '&[data-dragging=true]': {
        transition: 'none',
      },
    },
  },
]);

export const Handle = style({
  flexShrink: 0,
  display: 'flex',
  justifyContent: 'center',
  padding: `${config.space.S300} 0`,
  '::after': {
    content: '""',
    width: toRem(36),
    height: toRem(4),
    borderRadius: config.radii.Pill,
    backgroundColor: color.Background.ContainerLine,
  },
});

export const Content = style({
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  padding: `0 ${config.space.S300} ${config.space.S400}`,
});

export const Title = style({
  flexShrink: 0,
  padding: `0 ${config.space.S400} ${config.space.S300}`,
});

// A desktop popup menu (folds Menu > groups separated by Lines) restyled as
// full-width cards, one per group, with finger-sized rows.
export const MenuContent = style({});
globalStyle(`${MenuContent} > *`, {
  maxWidth: 'none !important',
  width: '100% !important',
  display: 'flex',
  flexDirection: 'column',
  gap: config.space.S300,
  backgroundColor: 'transparent',
  boxShadow: 'none',
  border: 'none',
});
globalStyle(`${MenuContent} > * > div:empty`, {
  display: 'none',
});
globalStyle(`${MenuContent} > * > div`, {
  gap: 0,
  borderRadius: config.radii.R400,
  backgroundColor: color.SurfaceVariant.Container,
});
// Plain backgrounds also keep a row from staying highlighted after a tap
// (touch leaves :hover set).
globalStyle(`${MenuContent} > * > div > button`, {
  height: 'auto',
  minHeight: toRem(52),
  backgroundColor: 'transparent',
});
globalStyle(`${MenuContent} > * > div > button:active`, {
  backgroundColor: color.SurfaceVariant.ContainerActive,
});
globalStyle(`${MenuContent} > * > div > button span`, {
  fontSize: toRem(16),
});
