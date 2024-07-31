const addFuncOrAttr = (element: HTMLElement, name: string, data: any) => {
  if (typeof data !== 'function') {
    addAttr(element, name, data);
    return;
  }

  return addFunc(element, name, data);
};

const addAttr = (element: HTMLElement, name: string, attr: any) => {
  element.setAttribute(name, attr);
};

export const addFunc = (element: HTMLElement, name: string, func: AnyFunc) => {
  if (!name.includes('-')) {
    element.addEventListener(name, func);
    return {
      name,
      listener: func,
    };
  }

  const config = {
    preventDefault: false,
    stopPropagation: false,
    stopImmediatePropagation: false,
    passive: false,
    capture: false,
    once: false,
    self: false,
  };

  let realName = '';

  for (let i = name.length, word = ''; i >= 0; i--) {
    const char = name[i];
    if (char === '-' || i === 0) {
      if (word in config) {
        config[word as keyof typeof config] = true;
      } else {
        realName = name.slice(0, i - 1);
      }
    } else {
      word = char + word;
    }
  }

  const preparedFunc = (event: Event) => {
    if (config.preventDefault) {
      event.preventDefault();
    }
    if (config.stopPropagation) {
      event.stopPropagation();
    }
    if (config.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    }
    if (config.self && event.target !== element) {
      return;
    }

    (func as Function)(event);
  };
  element.addEventListener(realName, preparedFunc, {
    passive: config.passive,
    capture: config.capture,
    once: config.once,
  });

  return {
    name: realName,
    listener: preparedFunc,
  };
};
