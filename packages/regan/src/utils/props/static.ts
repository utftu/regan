type StaticProps = Record<string, any>;

export const initStaticProps = (
  element: HTMLElement,
  staticProps: StaticProps
) => {
  for (const name in staticProps) {
    const value = staticProps[name];

    if (typeof value === 'function') {
      element.addEventListener(name, value);
    } else {
      element.setAttribute(name, value);
    }
  }
};
