import {hydrate, render, h, detachChildren} from 'regan';

console.log('-----', 'client module is...222', h);

export default (element: HTMLElement) => {
  return async (
    Component: any,
    props: Record<string, any>,
    {default: children, ...slotted}: Record<string, any>,
    {client}: Record<string, string>
  ) => {
    console.log('Component is 123', Component);
    console.log('-----', 'before', element);
    if (!element.hasAttribute('ssr')) return;

    console.log('-----', 'after');
    console.log('-----', 'client', client);

    debugger;
    let hNode;
    if (client === 'only') {
      element.innerHTML = '';
      console.log('-----', 'element1', element);
      console.log('-----', 'Component', Component);
      hNode = render(element, h(Component, props, [])).hNode;
      console.log('-----', 'hNode', hNode);
    } else {
      hNode = hydrate(element, h(Component, props, [])).hNode;
    }

    element.addEventListener('astro:unmount', () => detachChildren(hNode), {
      once: true,
    });
  };
};
