import {describe, it} from 'vitest';
import {VNew} from './types.ts';
import {HNodeComponent} from '../h-node/component.ts';
import {HNodeText} from '../h-node/text.ts';
import {JSDOM} from 'jsdom';
import {handleEdgeTextCases} from './edge.ts';

describe('v/edge', () => {
  it('a', () => {
    // const window = new
    const jsdom = new JSDOM();
    const rootHNode = new HNodeComponent(null as any);
    const leftHText = new HNodeText(null as any, {
      textNode: jsdom.window.document.createTextNode('1'),
      start: 0,
      text: '1',
    });
    const middleHComponent = new HNodeComponent(null as any);
    const rightHText = new HNodeText(null as any, {
      textNode: jsdom.window.document.createTextNode('2'),
      start: 0,
      text: '2',
    });

    rootHNode.children = [leftHText, middleHComponent, rightHText];
    rootHNode.children.forEach((child) => (child.parent = rootHNode));

    const vNews: VNew[] = [
      {
        type: 'text',
        data: {
          text: 'hello',
        },
        meta: {
          skip: false,
        },
      },
      {
        type: 'element',
        data: {
          tag: 'div',
          props: {},
        },
        children: [],
        meta: {
          skip: false,
        },
      },
      {
        type: 'text',
        data: {
          text: 'world',
        },
        meta: {
          skip: false,
        },
      },
    ];

    handleEdgeTextCases(vNews, [], rootHNode, jsdom.window as any);
  });
});
