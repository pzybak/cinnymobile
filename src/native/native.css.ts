import { globalStyle } from '@vanilla-extract/css';
import { color } from 'folds';

// The safe-area padding on #root exposes the body behind the system bars;
// paint it with the theme background instead of the default white.
globalStyle('html.native body', {
  backgroundColor: color.Background.Container,
});
