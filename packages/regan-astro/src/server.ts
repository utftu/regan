import type {NamedSSRLoadedRendererValue} from 'astro';
import {h, stringify} from 'regan';

console.log('-----', 'server module');

const renderer: NamedSSRLoadedRendererValue = {
  name: 'astro-regan',
  async check(Component) {
    return typeof Component === 'function';
  },
  async renderToStaticMarkup(
    Component,
    props,
    {default: children, ...slotted}: Record<string, any>
  ) {
    console.log('-----', 'SERVER');
    const node = h(Component, props, []);
    const str = stringify(node);

    return {html: str}; // Replace with your framework’s stringification logic
  },
  supportsAstroStaticSlot: false,
};

export default renderer;
