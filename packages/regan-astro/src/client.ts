import {hydrate, render, h, detachChildren} from 'regan';

export default (element: HTMLElement) =>
  async (
    Component: any,
    props: Record<string, any>,
    {default: children, ...slotted}: Record<string, any>,
    {client}: Record<string, string>
  ) => {
    if (!element.hasAttribute('ssr')) return;

    let hNode;
    if (client === 'only') {
      element.innerHTML = '';
      hNode = render(element, h(Component, props, [])).hNode;
    } else {
      hNode = hydrate(element, h(Component, props, [])).hNode;
    }

    element.addEventListener('astro:unmount', () => detachChildren(hNode), {
      once: true,
    });
  };
