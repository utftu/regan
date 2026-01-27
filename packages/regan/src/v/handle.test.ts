import {createContext, getContextValue} from '../regan.ts';
import {describe, expect, it, vi} from 'vitest';
import {VNewElement, VNewText, VOldElement, VOldText} from './types.ts';
import {JSDOM} from 'jsdom';
import {handle} from './handle.ts';
import {ListenerManager} from '../utils/listeners.ts';
import {DomPointer} from '../types.ts';

export const createDomPointer = (window: Window): DomPointer => {
  const parent = window.document.createElement('div');
  return {
    parent,
    nodeCount: 0,
  };
};

const jsdom = new JSDOM();
const window = jsdom.window as any as Window;
const document = jsdom.window.document;

const createListenerManager = () => {
  const dumpSegmentEnt = vi.fn();

  // return new ListenerManager({} as any);
  return new ListenerManager(dumpSegmentEnt as any);
};

const vNewElement: VNewElement = {
  type: 'element',
  data: {
    tag: 'div',
    props: {
      a: 'aa',
      b: 'bb',
    },
  },
  children: [],
  listenerManager: createListenerManager(),
};

const getVOldElement = (): VOldElement => {
  const element = document.createElement('div');
  element.setAttribute('a', 'a');
  element.setAttribute('b', 'b');

  return {
    type: 'element',
    data: {
      tag: 'div',
      props: {
        a: 'a',
        b: 'b',
      },
    },
    element,
    children: [],
    listenerManager: new ListenerManager(null as any),
  };
};

const vNewText: VNewText = {
  type: 'text',
  data: {
    text: 'helloworld',
  },
};

const getVOldText = (): VOldText => {
  return {
    type: 'text',
    data: {
      text: 'hello',
    },
    textNode: document.createTextNode('hello'),
  };
};

describe('v/handle', () => {
  it('null => text', () => {
    const domPointer = createDomPointer(window);
    const {parent} = domPointer;

    handle({
      vNew: vNewText,
      window,
      domPointer,
    });
    expect(parent.childNodes[0].textContent).toBe('helloworld');
  });
  it('text => null', () => {
    const domPointer = createDomPointer(window);
    const {parent} = domPointer;

    const vOldText = getVOldText();
    parent.appendChild(vOldText.textNode);

    handle({vOld: vOldText, window, domPointer});
    expect(parent.childNodes.length).toBe(0);
  });
  it('null => element', () => {
    const domPointer = createDomPointer(window);
    const {parent} = domPointer;
    handle({vNew: vNewElement, window, domPointer});

    expect(parent.children[0].getAttribute('a')).toBe('aa');
  });
  it('element => null', () => {
    const domPointer = createDomPointer(window);
    const {parent} = domPointer;

    const vOldElement = getVOldElement();
    parent.appendChild(vOldElement.element);
    handle({vOld: vOldElement, window, domPointer});

    expect(parent.childNodes.length).toBe(0);
  });
  it('text => element', () => {
    const domPointer = createDomPointer(window);
    const {parent} = domPointer;
    const vOldText = getVOldText();
    parent.appendChild(vOldText.textNode);

    handle({vNew: vNewElement, vOld: vOldText, window, domPointer});
    expect(parent.childNodes.length).toBe(1);
    expect((parent.childNodes[0] as Element).tagName).toBe('DIV');
  });

  it('element => text', () => {
    const domPointer = createDomPointer(window);
    const {parent} = domPointer;
    const vOldElement = getVOldElement();
    parent.appendChild(vOldElement.element);

    handle({vNew: vNewText, vOld: vOldElement, window, domPointer});
    expect(parent.childNodes.length).toBe(1);
    expect(parent.childNodes[0].textContent).toBe('helloworld');
  });
  it('element => element', () => {
    const domPointer = createDomPointer(window);
    const {parent} = domPointer;
    const vOldElement = getVOldElement();
    parent.appendChild(vOldElement.element);

    handle({vNew: vNewElement, vOld: vOldElement, window, domPointer});
    expect(parent.children[0]).toBe(vOldElement.element);
    expect(parent.children[0].getAttribute('a')).toBe('aa');
  });
  it('element => element (diff tag)', () => {
    const domPointer = createDomPointer(window);
    const {parent} = domPointer;
    const elementSpan = document.createElement('span');
    elementSpan.setAttribute('a', 'aa');
    elementSpan.setAttribute('b', 'bb');

    const vOldElement: VOldElement = {
      type: 'element',
      data: {
        tag: 'span',
        props: {
          a: 'aa',
          b: 'bb',
        },
      },
      element: elementSpan,
      children: [],
      listenerManager: createListenerManager(),
    };
    parent.appendChild(vOldElement.element);

    handle({vNew: vNewElement, vOld: vOldElement, window, domPointer});

    expect(parent.children[0].tagName).toBe('DIV');
    expect(parent.children[0].getAttribute('a')).toBe('aa');
  });
  it('text => text', () => {
    const domPointer = createDomPointer(window);
    const {parent} = domPointer;
    const vOldText = getVOldText();
    parent.appendChild(vOldText.textNode);

    handle({vNew: vNewText, vOld: vOldText, window, domPointer});

    expect(parent.childNodes[0].textContent).toBe('helloworld');
  });
  it('init text', () => {
    const domPointer = createDomPointer(window);
    const mockFn = vi.fn();

    const vNewTextMy: VNewText = {...vNewText, init: mockFn};

    handle({vNew: vNewTextMy, window, domPointer});
    expect(mockFn.mock.calls.length).toBe(1);
    expect(mockFn.mock.calls[0][0]).toBe(vNewTextMy);
  });
  it('init element', () => {
    const domPointer = createDomPointer(window);
    const {parent} = domPointer;
    const mockFn = vi.fn();

    const vNewElementtMy: VNewElement = {...vNewElement, init: mockFn};

    handle({vNew: vNewElementtMy, window, domPointer});
    expect(mockFn.mock.calls.length).toBe(1);
    expect(mockFn.mock.calls[0][0]).toBe(vNewElementtMy);
  });
});
