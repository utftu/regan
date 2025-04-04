import {createElementString} from './flat.ts';
import {describe, expect, it} from 'vitest';

describe('node', () => {
  it('createElementString', () => {
    const div = createElementString({tagName: 'div', props: {hello: 'world'}});
    expect(div.left).toBe('<div hello="world">');
    expect(div.right).toBe('</div>');

    const br = createElementString({tagName: 'br', props: {hello: 'world'}});
    expect(br.left).toBe('<br hello="world">');
    expect(br.right).toBe('');
  });
});
