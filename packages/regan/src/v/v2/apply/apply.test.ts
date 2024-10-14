import {describe, expect, it} from 'vitest';
import {apply} from './apply.ts';
import {JSDOM} from 'jsdom';
import {VElementOld} from '../old.ts';

describe('v/apply', () => {
  it('delete', () => {
    const jsdom = new JSDOM();
    const parentElement = jsdom.window.document.createElement('div');
    const element = jsdom.window.document.createElement('div');
    parentElement.append(element);

    apply({
      window: jsdom.window as any as Window,
      event: {
        type: 'delete',
      },
      vNew: null as any,
      vOld: {
        type: 'element',
        tag: 'div',
        props: {},
        dynamicProps: {},
        domNode: element,
        children: [],
      } as VElementOld,
      control: null as any,
    });

    expect(element.isConnected).toBe(false);
  });
  it('create text', () => {
    const jsdom = new JSDOM();

    const nodes: Node[] = [];
    apply({
      window: jsdom.window as any as Window,
      event: {
        type: 'create',
      },
      vNew: {
        type: 'text',
        text: 'hello',
        start: 0,
      },
      vOld: undefined,
      control: {addNode: (node) => nodes.push(node)},
    });

    expect(nodes.length).toBe(1);
    expect(nodes[0].nodeType).toBe(jsdom.window.Node.TEXT_NODE);
    expect(nodes[0].textContent).toBe('hello');
  });
  it('create element', () => {
    const jsdom = new JSDOM();
    const window = jsdom.window;

    const nodes: Element[] = [];
    apply({
      window: window as any as Window,
      event: {
        type: 'create',
      },
      vNew: {
        type: 'element',
        tag: 'div',
        children: [],
        props: {
          hello: 'world',
        },
      },
      vOld: undefined,
      control: {addNode: (node) => nodes.push(node as Element)},
    });

    expect(nodes.length).toBe(1);
    const element = nodes[0];
    expect(element.nodeType).toBe(window.Node.ELEMENT_NODE);
    expect(element.tagName).toBe('DIV');
    expect(element.getAttribute('hello')).toBe('world');
  });
  it('replaceFull', () => {
    const jsdom = new JSDOM();
    const parentElement = jsdom.window.document.createElement('div');
    const oldText = jsdom.window.document.createTextNode('hello');
    parentElement.append(oldText);

    apply({
      event: {
        type: 'replaceFull',
      },
      vNew: {
        type: 'text',
        text: 'world',
        start: 0,
      },
      vOld: {
        type: 'text',
        text: 'hello',
        start: 0,
        domNode: oldText,
      },
      window: jsdom.window as any,
      control: null as any,
    });

    expect(parentElement.textContent).toBe('world');
  });
  it('nextText', () => {
    // do nothing
    apply({
      event: {
        type: 'nextText',
      },
      vNew: {
        type: 'text',
        text: 'world',
        start: 0,
      },
      vOld: {
        type: 'text',
        text: 'hello',
        start: 0,
        domNode: null as any,
      },
      window: null as any,
      control: null as any,
    });
  });
});
