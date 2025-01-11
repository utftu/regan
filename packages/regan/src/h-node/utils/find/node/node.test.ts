import {describe, expect, it} from 'vitest';
import {HNodeBase} from '../../../h-node.ts';
import {HNodeElement} from '../../../element.ts';
import {findPrevDomNodeHNode, getNearestHNodeElement} from './node.ts';

describe('find/node', () => {
  it('findPrevDomNodeHNode()', () => {
    const prevElement = new HNodeElement(
      {} as any,
      {
        element: 'hello',
      } as any
    );

    const parent1 = new HNodeBase({} as any);
    const parent2 = new HNodeBase({} as any);
    const parent3 = new HNodeElement({} as any, {} as any);

    parent2.children.push(prevElement);
    prevElement.parent = parent2;

    parent2.children.push(parent1);
    parent1.parent = parent2;

    parent3.children.push(parent2);
    parent2.parent = parent3;

    const {prevNode, lastParentHNode} = findPrevDomNodeHNode(parent1);

    expect(prevNode).toBe('hello');
    expect(lastParentHNode).toBe(parent2);
  });
  it('getNearestHNodeElement()', () => {
    const parent1 = new HNodeBase({} as any);
    const parent2 = new HNodeBase({} as any);
    const parent3 = new HNodeElement({} as any, {} as any);

    parent2.children.push(parent1);
    parent1.parent = parent2;

    parent3.children.push(parent2);
    parent2.parent = parent3;

    const findedHNode = getNearestHNodeElement(parent1);
    expect(findedHNode).toBe(parent3);
  });
});
