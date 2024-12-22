import {describe, expect, it} from 'vitest';
import {HNodeComponent} from '../h-node/component.ts';
import {HNodeText} from '../h-node/text.ts';
import {VNew, VOld} from './types.ts';
import {JSDOM} from 'jsdom';
import {virtualApplyExternal} from './v.ts';

const jsdom = new JSDOM();
const window = jsdom.window as any as Window;
const document = window.document;

const createParent = () => {
  return document.createElement('div');
};

const createHNodes = () => {
  const rootHNode = new HNodeComponent({} as any);
  const leftHText = new HNodeText({} as any, {
    textNode: window.document.createTextNode('1'),
    start: 0,
    text: '1',
  });
  const middleHNode = new HNodeComponent({} as any);
  const rightHNode = new HNodeComponent({} as any);

  rootHNode.children = [leftHText, middleHNode, rightHNode];
  rootHNode.children.forEach((child) => (child.parent = rootHNode));

  return {
    rootHNode,
    leftHText,
    middleHNode,
    rightHNode,
  };
};

const vNews: VNew[] = [
  {type: 'text', data: {text: 'hello'}},
  {
    type: 'element',
    data: {tag: 'div', props: {a: 'aa', b: 'bb'}},
    children: [
      {type: 'text', data: {text: 'helloInner'}},
      {
        type: 'element',
        data: {tag: 'div', props: {a: 'aInner', b: 'bInner'}},
        children: [],
      },
    ],
  },
];

const vNews2: VNew[] = [
  {
    type: 'element',
    data: {tag: 'div', props: {a: 'aa2', b: 'bb2'}},
    children: [
      {
        type: 'element',
        data: {tag: 'div', props: {a: 'aInner2', b: 'bInner2'}},
        children: [],
      },
      {type: 'text', data: {text: 'worldInner'}},
    ],
  },
  {type: 'text', data: {text: 'world'}},
];

describe('v/v', () => {
  it('create', () => {
    const {leftHText, middleHNode} = createHNodes();
    const parent = createParent();
    parent.appendChild(leftHText.textNode);

    virtualApplyExternal(vNews, [], middleHNode, parent, window);

    expect(parent.childNodes.length).toBe(2);
    expect(parent.childNodes[0].textContent).toBe('1hello');

    const element = parent.childNodes[1] as Element;
    expect(element.getAttribute('a')).toBe('aa');
    expect(element.childNodes.length).toBe(2);

    expect(element.childNodes[0].textContent).toBe('helloInner');
    expect((element.childNodes[1] as Element).getAttribute('a')).toBe('aInner');
  });
  it('remove', () => {
    const {leftHText, middleHNode} = createHNodes();
    const parent = createParent();
    parent.appendChild(leftHText.textNode);

    // to create something before remove
    virtualApplyExternal(vNews, [], middleHNode, parent, window);

    const vOlds = vNews as VOld[];

    virtualApplyExternal([], vOlds, middleHNode, parent, window);

    expect(parent.childNodes.length).toBe(1);
    expect(parent.childNodes[0].textContent).toBe('1');
  });
  it('replace', () => {
    const {leftHText, middleHNode} = createHNodes();
    const parent = createParent();
    parent.appendChild(leftHText.textNode);

    // to create something before replace
    virtualApplyExternal(vNews, [], middleHNode, parent, window);

    const vOlds = vNews as VOld[];

    virtualApplyExternal(vNews2, vOlds, middleHNode, parent, window);

    expect(parent.childNodes.length).toBe(3);
    expect(parent.childNodes[0].textContent).toBe('1');

    expect(parent.childNodes[2].textContent).toBe('world');

    const element = parent.childNodes[1] as Element;

    expect(element.getAttribute('a')).toBe('aa2');

    expect(element.childNodes.length).toBe(2);
  });
});
