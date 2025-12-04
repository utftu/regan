import {describe, it, expect} from 'vitest';
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

  it('склеивает соседние текстовые узлы через store', () => {
    const store: any = {};

    const n1 = new HNodeText(hNodeProps, {text: 'he', textNode});
    const n2 = new HNodeText(hNodeProps, {text: 'llo', textNode});

    const r1 = convertHToV(n1, store);
    const r2 = convertHToV(n2, store);

    expect(r1.length).toBe(1);
    expect(r2.length).toBe(0);

    expect(store.text.data.text).toBe('hello');
  });
});
