import {describe, expect, it} from 'vitest';
import {VNew, VNewElement, VOld, VOldElement} from './types.ts';
import {HNodeComponent} from '../h-node/component.ts';
import {HNodeText} from '../h-node/text.ts';
import {JSDOM} from 'jsdom';
import {handleEdgeTextCases} from './edge.ts';
import {LisneterManager} from '../utils/props/funcs.ts';

const jsdom = new JSDOM();

const div: VNewElement = {
  type: 'element',
  data: {
    tag: 'div',
    props: {},
  },
  children: [],
  keyStore: {},
  listenerManager: new LisneterManager({} as any),
};

const getOldDiv = (): VOldElement => {
  return {
    ...div,
    children: [],
    element: jsdom.window.document.createElement('div'),
    keyStore: {},
  };
};

const vNews: VNew[] = [
  {
    type: 'text',
    data: {
      text: 'hello',
    },
  },
  div,
  {
    type: 'text',
    data: {
      text: 'world',
    },
  },
];

const createHNodes = () => {
  const rootHNode = new HNodeComponent({} as any);
  const leftHText = new HNodeText({} as any, {
    textNode: jsdom.window.document.createTextNode('1'),
    start: 0,
    text: '1',
  });
  const middleHNode = new HNodeComponent({} as any);
  const rightHText = new HNodeText({} as any, {
    textNode: jsdom.window.document.createTextNode('2'),
    start: 0,
    text: '2',
  });

  rootHNode.children = [leftHText, middleHNode, rightHText];
  rootHNode.children.forEach((child) => (child.parent = rootHNode));

  return {
    rootHNode,
    leftHText,
    middleHNode,
    rightHText,
  };
};

describe('v/edge', () => {
  it('edges', () => {
    const {leftHText, middleHNode, rightHText} = createHNodes();
    leftHText.textNode.textContent += 'x';
    rightHText.textNode.textContent = 'y' + rightHText.textNode.textContent;
    rightHText.start = 1;

    const vOlds: VOld[] = [
      {
        type: 'text',
        data: {
          text: 'x',
        },
        textNode: leftHText.textNode,
      },
      getOldDiv(),
      {
        type: 'text',
        data: {
          text: 'y',
        },
        textNode: rightHText.textNode,
      },
    ];

    const actions = handleEdgeTextCases(
      vNews,
      vOlds,
      middleHNode,
      jsdom.window as any
    );
    actions.forEach((action) => action());

    expect(leftHText.textNode.textContent).toBe('1hello');
    expect(rightHText.textNode.textContent).toBe('world2');
    expect(rightHText.start).toBe(5);
  });
  it('full join', () => {
    const {leftHText, middleHNode, rightHText} = createHNodes();
    const vNews: VNew[] = [];
    const vOlds = [getOldDiv()];

    const actions = handleEdgeTextCases(
      vNews,
      vOlds,
      middleHNode,
      jsdom.window as any
    );

    actions.forEach((action) => action());

    expect(leftHText.textNode.textContent).toBe('12');
    expect(leftHText.textNode).toBe(rightHText.textNode);
    expect(rightHText.start).toBe(1);
  });
  it('full split', () => {
    const {leftHText, middleHNode, rightHText} = createHNodes();

    // join to test
    handleEdgeTextCases([], [], middleHNode, jsdom.window as any);

    const vNew = [div];

    const actions = handleEdgeTextCases(
      vNew,
      [],
      middleHNode,
      jsdom.window as any
    );

    actions.forEach((action) => action());

    expect(leftHText.textNode.textContent).toBe('1');
    expect(rightHText.textNode.textContent).toBe('2');
  });
  it('full join with text', () => {
    const {leftHText, middleHNode, rightHText} = createHNodes();

    const vNewsMy = [vNews[0]];

    const actions = handleEdgeTextCases(
      vNewsMy,
      [],
      middleHNode,
      jsdom.window as any
    );
    actions.forEach((action) => action());

    expect(leftHText.textNode.textContent).toBe('1hello2');
    expect(leftHText.textNode).toBe(rightHText.textNode);
  });
  it('full split with text', () => {
    const {leftHText, middleHNode, rightHText} = createHNodes();

    const firtVNewTexts = [vNews[0]];
    // join to test
    handleEdgeTextCases(firtVNewTexts, [], middleHNode, jsdom.window as any);

    handleEdgeTextCases(
      [div],
      firtVNewTexts as any[],
      middleHNode,
      jsdom.window as any
    );

    expect(leftHText.textNode.textContent).toBe('1');
    expect(rightHText.textNode.textContent).toBe('2');
  });
});
