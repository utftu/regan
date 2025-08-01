import {hydrate, render, h, detachChildren} from 'regan';

console.log('-----', 'client2 module');

export default (element: HTMLElement) =>
  async (
    Component: any,
    props: Record<string, any>,
    {default: children, ...slotted}: Record<string, any>,
    {client}: Record<string, string>
  ) => {
    console.log('-----', 'client2');
    if (!element.hasAttribute('ssr')) return;

    debugger;
    let hNode;
    if (client === 'only') {
      element.innerHTML = '';
      console.log('-----', 'element', element);
      console.log('-----', Component);
      hNode = render(element, h(Component, props, [])).hNode;
    } else {
      hNode = hydrate(element, h(Component, props, [])).hNode;
    }

    element.addEventListener('astro:unmount', () => detachChildren(hNode), {
      once: true,
    });
  };
