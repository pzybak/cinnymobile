/**
 * Touch screens keep :hover on the last element tapped, so hover styles
 * (from folds and from our own vanilla-extract styles) stayed stuck on after
 * a tap. Move every :hover selector into `@media (hover: hover)`, leaving
 * the rest of a selector list, such as :focus-visible, where it was.
 */
const hoverOnlyWhereHoverable = () => ({
  postcssPlugin: 'hover-only-where-hoverable',
  Rule(rule, { AtRule }) {
    if (!rule.selector.includes(':hover')) return;
    for (let parent = rule.parent; parent; parent = parent.parent) {
      if (parent.type === 'atrule' && parent.name === 'media' && parent.params.includes('hover: hover')) {
        return;
      }
    }

    const hover = rule.selectors.filter((selector) => selector.includes(':hover'));
    const rest = rule.selectors.filter((selector) => !selector.includes(':hover'));
    const media = new AtRule({ name: 'media', params: '(hover: hover)' });
    media.append(rule.clone({ selectors: hover }));
    rule.after(media);
    if (rest.length > 0) rule.selectors = rest;
    else rule.remove();
  },
});
hoverOnlyWhereHoverable.postcss = true;

export default {
  plugins: [hoverOnlyWhereHoverable()],
};
