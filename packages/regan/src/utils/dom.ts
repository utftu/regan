export const addElementChildren = ({
  parent,
  prev = undefined,
  elements,
}: {
  parent: HTMLElement;
  prev?: HTMLElement | void;
  elements: (HTMLElement | string)[];
}) => {
  if (!prev) {
    parent.prepend(...elements);
    return;
  }

  prev.after(...elements);
};

export const appendElementChild = ({
  parent,
  el,
}: {
  parent: HTMLElement;
  el: HTMLElement | string;
}) => {
  parent.append(el);
};
