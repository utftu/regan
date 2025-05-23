import {describe, expect, it, vi} from 'vitest';
import {VNewElement, VNewText, VOldElement} from './types.ts';
import {createParent} from './test-helpers.ts';
import {JSDOM} from 'jsdom';
import {handleKey} from './key.ts';
import {LisneterManager} from '../utils/props/funcs.ts';

const jsdom = new JSDOM();
const window = jsdom.window as any as Window;
const document = window.document;

const createListenerManager = () => {
  const dumpSegmentEnt = vi.fn();

  return new LisneterManager(dumpSegmentEnt as any);
};

const createVNewElement = (): VNewElement => {
  const vNewElement: VNewElement = {
    type: 'element',
    key: 'hello',
    data: {
      tag: 'div',
      props: {
        a: 'aa',
      },
    },
    keyStore: {},
    children: [],
    listenerManager: createListenerManager(),
  };
  return vNewElement;
};

const creatVOldElement = (): VOldElement => {
  const element = document.createElement('div');
  element.setAttribute('b', 'bb');

  const vOldElement: VOldElement = {
    type: 'element',
    key: 'hello',
    data: {
      tag: 'div',
      props: {
        b: 'bb',
      },
    },
    keyStore: {},
    children: [],
    element,
    listenerManager: createListenerManager(),
  };

  return vOldElement;
};

describe('v/key', () => {
  it('vNew is not a element', () => {
    const vNewText: VNewText = {
      type: 'text',
      data: {
        text: 'hello',
      },
    };

    handleKey({
      vNew: vNewText,
      keyStoreNew: {},
      keyStoreOld: {},
      window,
      parentDomPointer: {parent: document.body, nodeCount: 0},
    });
  });
  it('not element in keyStoreOld', () => {
    const init = vi.fn();
    const vNewElement: VNewElement = {...createVNewElement(), init};

    handleKey({
      vNew: vNewElement,
      keyStoreNew: {},
      keyStoreOld: {},
      window,
      parentDomPointer: {parent: document.body, nodeCount: 0},
    });

    expect((vNewElement as VOldElement).element).toBe(undefined);
    expect(init.mock.calls.length).toBe(0);
  });
  it('patch', () => {
    const parent = createParent(window);

    const init = vi.fn();

    const vOldElement = creatVOldElement();
    const vNewElement: VNewElement = {...createVNewElement(), init};

    parent.appendChild(vOldElement.element);

    handleKey({
      vNew: vNewElement,
      keyStoreNew: {},
      keyStoreOld: {
        hello: vOldElement,
      },
      window,
      parentDomPointer: {parent, nodeCount: 0},
    });

    const element = parent.childNodes[0] as Element;
    expect(element).toBe(vOldElement.element);
    expect((vNewElement as VOldElement).element).toBe(vOldElement.element);
    expect(element.getAttribute('a')).toBe('aa');
    expect(element.getAttribute('b')).toBe(null);

    expect(vOldElement.skip).toBe(true);
    expect(vNewElement.skip).toBe(true);

    expect(init.mock.calls.length).toBe(1);
  });
});
