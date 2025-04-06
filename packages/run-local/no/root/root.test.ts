import {Mock, describe, expect, it, vi} from 'vitest';
import {Root} from './root.ts';
import {createAtomRegan} from '../atoms/atoms.ts';
import {Atom} from 'strangelove';
import {Exec} from './atoms-store/atoms-store.ts';

type MockedExec = Exec & Mock;

describe('root', () => {
  describe('omit', () => {
    it('single', async () => {
      const externalAtom = createAtomRegan('1');
      const exec = vi.fn() as Exec & Mock;
      const root = new Root();
      root.atomsStore.addExec(externalAtom, exec);

      root.addTx(new Map([[externalAtom, '2']]));
      await root.addTx(new Map([[externalAtom, '3']]));

      expect(exec.mock.calls.length).toBe(1);
      expect(exec.mock.calls[0][0]).toBe('3');
    });
    it('not omit', async () => {
      const externalAtom = createAtomRegan('1');
      const externalAtom2 = createAtomRegan('1');
      const exec = vi.fn() as MockedExec;
      const exec2 = vi.fn() as MockedExec;
      const root = new Root();
      root.atomsStore.addExec(externalAtom, exec);
      root.atomsStore.addExec(externalAtom2, exec2);

      root.addTx(
        new Map<Atom, any>([
          [externalAtom, '2'],
          [externalAtom2, 42],
        ])
      );
      await root.addTx(new Map([[externalAtom, '3']]));

      expect(exec.mock.calls.length).toBe(2);
      expect(exec2.mock.calls.length).toBe(1);

      expect(exec.mock.calls[0][0]).toBe('2');
      expect(exec.mock.calls[1][0]).toBe('3');
      expect(exec2.mock.calls[0][0]).toBe(42);
    });
    it('run-omit-run', async () => {
      const root = new Root();

      const atom1 = createAtomRegan('1 atom');
      const exec1 = vi.fn() as MockedExec;

      const atom2 = createAtomRegan('2 atom');
      const action2 = vi.fn();
      const exec2 = vi.fn(() => action2) as MockedExec;

      root.atomsStore.addExec(atom1, exec1);
      root.atomsStore.addExec(atom2, exec2);

      root.addTx(
        new Map([
          [atom1, '0'],
          [atom2, '0'],
        ])
      );
      root.addTx(new Map([[atom2, '1']]));
      await root.addTx(new Map([[atom2, '2']]));

      expect(exec1.mock.calls.length).toBe(1);
      expect(exec2.mock.calls.length).toBe(2);

      expect(exec1.mock.calls[0][0]).toBe('0');
      expect(exec2.mock.calls[0][0]).toBe('0');
      expect(exec2.mock.calls[1][0]).toBe('2');
    });
    it('omit limit', async () => {
      const root = new Root();

      const atom1 = createAtomRegan('1 atom');
      const exec1 = vi.fn() as MockedExec;

      root.atomsStore.addExec(atom1, exec1);

      const txs = new Array(11).fill(null).map((_, i) => {
        return root.addTx(new Map([[atom1, (i + 1).toString()]]));
      });
      await txs[10];

      expect(exec1.mock.calls.length).toBe(1);
      expect(exec1.mock.calls[0][0]).toBe('11');
    });
  });
});
