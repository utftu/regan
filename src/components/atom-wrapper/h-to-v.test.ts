import {describe, it, expect} from 'bun:test';
import {HNodeText} from '../../h-node/text.ts';
import {convertHToV} from './h-to-v.ts';
import {JsxNodeElement} from '../../jsx-node/variants/element/element.ts';
import {HNodeElement} from '../../h-node/element.ts';

class HNodeComponent {
  _class = 'hNodeComponent';
  constructor(public children: any[]) {}
}

const textNode = {} as any;
const hNodeProps = {
  segmentEnt: {} as any,
} as any;

describe('convertHToV', () => {
  it('конвертирует один текстовый узел', () => {
    const node = new HNodeText(hNodeProps, {text: 'hello', textNode});
    const result = convertHToV(node);

    expect(result).toEqual([
      {
        type: 'text',
        data: {text: 'hello'},
        textNode: node.textNode,
      },
    ]);
  });

  it('каждый текстовый узел даёт свой vOld', () => {
    const n1 = new HNodeText(hNodeProps, {text: 'he', textNode});
    const n2 = new HNodeText(hNodeProps, {text: 'llo', textNode});

    expect(convertHToV(n1).length).toBe(1);
    expect(convertHToV(n2).length).toBe(1);
  });
});
