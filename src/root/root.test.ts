import {describe, it, vi} from 'vitest';
import {Root} from './root.ts';
import {createAtomRegan} from '../atoms/atoms.ts';

describe('root', () => {
  it('1', async () => {
    const action = vi.fn();
    const externalAtom = createAtomRegan('1');
    const exec = async () => action;
    const root = new Root();
    root.links.add(externalAtom, exec);

    root.addTx(new Map([[externalAtom, '2']]));
    await root.addTx(new Map([[externalAtom, '3']]));

    // console.log('-----', '', );
  });
});
