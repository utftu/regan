export default {
  name: 'regan',
  check(Component) {
    return typeof Component === 'function';
  },
  renderToStaticMarkup(Component, props) {
    return {html: Component(props).toString()}; // Replace with real logic
  },
  renderToString(Component, props) {
    return {html: Component(props).toString()};
  },
  hydrate(Component, props, element) {
    element.innerHTML = Component(props).toString(); // Replace with real hydration
  },
};
