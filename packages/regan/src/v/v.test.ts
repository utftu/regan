import {describe, expect, it} from 'vitest';
import {HNodeComponent} from '../h-node/component.ts';
import {HNodeText} from '../h-node/text.ts';
import {VNew, VNewElement, VOld, VOldElement} from './types.ts';
import {JSDOM} from 'jsdom';
import {virtualApplyExternal} from './v.ts';
import {createDomPointer, createParent} from './test-helpers.ts';
import {DomPointer} from '../types.ts';

const jsdom = new JSDOM();
const window = jsdom.window as any as Window;

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

const createVNews1 = (): VNew[] => {
  const vNews1: VNew[] = [
    {type: 'text', data: {text: 'hello'}},
    {
      type: 'element',
      data: {tag: 'div', props: {a: 'aa', b: 'bb'}},
      keyStore: {},
      children: [
        {type: 'text', data: {text: 'helloInner'}},
        {
          type: 'element',
          data: {tag: 'div', props: {a: 'aInner', b: 'bInner'}},
          children: [],
          keyStore: {},
        },
      ],
    },
  ];
  return vNews1;
};

const createVNews2 = (): VNew[] => {
  const vNews2: VNew[] = [
    {
      type: 'element',
      data: {tag: 'div', props: {a: 'aa2', b: 'bb2'}},
      keyStore: {},
      children: [
        {
          type: 'element',
          data: {tag: 'div', props: {a: 'aInner2', b: 'bInner2'}},
          children: [],
          keyStore: {},
        },
        {type: 'text', data: {text: 'worldInner'}},
      ],
    },
    {type: 'text', data: {text: 'world'}},
  ];
  return vNews2;
};

describe('v/v', () => {
  it('create', () => {
    const {leftHText, middleHNode} = createHNodes();
    // const domPointer = createDomPointer(window);
    // const {parent} = domPointer;
    const parent = createParent(window);
    const domPointer: DomPointer = {
      parent,
      nodeCount: 0,
    };
    parent.appendChild(leftHText.textNode);

    const vNews1 = createVNews1();

    virtualApplyExternal({
      vNews: vNews1,
      vOlds: [],
      hNode: middleHNode,
      domPointer,
      window,
    });

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
    const domPointer = createDomPointer(window);
    const {parent} = domPointer;
    parent.appendChild(leftHText.textNode);

    const vNews1 = createVNews1();

    // to create something before remove
    virtualApplyExternal({
      vNews: vNews1,
      vOlds: [],
      hNode: middleHNode,
      domPointer,
      window,
    });

    const vOlds = vNews1 as VOld[];

    virtualApplyExternal({
      vNews: [],
      vOlds,
      hNode: middleHNode,
      domPointer,
      window,
    });

    expect(parent.childNodes.length).toBe(1);
    expect(parent.childNodes[0].textContent).toBe('1');
  });
  it.only('replace', () => {
    const {leftHText, middleHNode} = createHNodes();
    const domPointer = createDomPointer(window);
    const {parent} = domPointer;
    parent.appendChild(leftHText.textNode);

    const vNews1 = createVNews1();
    const vNews2 = createVNews2();

    // to create something before replace
    virtualApplyExternal({
      vNews: vNews1,
      vOlds: [],
      hNode: middleHNode,
      domPointer: {
        parent: domPointer.parent,
        nodeCount: 1,
      },
      window,
    });

    console.log('-----', '1', (domPointer.parent as Element).innerHTML);

    const vOlds = vNews1 as VOld[];

    console.log('-----', 'second', '-----');

    virtualApplyExternal({
      vNews: vNews2,
      vOlds,
      hNode: middleHNode,
      domPointer: {
        parent: domPointer.parent,
        nodeCount: 1,
      },
      window,
    });

    console.log('-----', '2', (domPointer.parent as Element).innerHTML);

    expect(parent.childNodes.length).toBe(3);
    expect(parent.childNodes[0].textContent).toBe('1');

    expect(parent.childNodes[2].textContent).toBe('world');

    const element = parent.childNodes[1] as Element;

    expect(element.getAttribute('a')).toBe('aa2');

    expect(element.childNodes.length).toBe(2);
  });
  it('key', () => {
    const domPointer = createDomPointer(window);
    const {parent} = domPointer;

    const vNews1 = createVNews1();
    (vNews1[1] as VNewElement).key = 'hello';
    const vNews2 = createVNews2();
    (vNews2[0] as VNewElement).key = 'hello';

    const parentHNode = new HNodeComponent({} as any);

    const firstRunStore = {};

    // preapre for test
    virtualApplyExternal({
      vNews: vNews1,
      vOlds: [],
      hNode: parentHNode,
      domPointer,
      window,
      keyStoreNew: firstRunStore,
    });

    virtualApplyExternal({
      keyStoreOld: firstRunStore,
      vNews: vNews2,
      vOlds: vNews1 as VOld[],
      hNode: parentHNode,
      domPointer,
      window,
    });

    const vNews1ElementVOld = vNews1[1] as VOldElement;
    const vNews2ElementVOld = vNews2[0] as VOldElement;

    expect(parent.childNodes.length).toBe(2);
    expect(vNews1ElementVOld.element).toBe(vNews2ElementVOld.element);
    expect(vNews1ElementVOld.element.getAttribute('a')).toBe('aa2');
  });
});
