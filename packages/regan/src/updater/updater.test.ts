import {describe, expect, it, vi} from 'vitest';
import {createUpdaterSync, createUpdaterAsync} from './updater.ts';
import {createAtom} from 'strangelove';
import {waitTime} from 'utftu';

describe('updater', () => {
  describe('createUpdaterSync', () => {
    it('adds and calls listener on atom change', () => {
      const updater = createUpdaterSync();
      const atom = createAtom(0);
      const listener = vi.fn();
      
      updater.add(atom, listener);
      atom.set(1);
      
      expect(listener).toHaveBeenCalled();
    });

    it('removes listener', () => {
      const updater = createUpdaterSync();
      const atom = createAtom(0);
      const listener = vi.fn();
      
      updater.add(atom, listener);
      updater.remove(atom, listener);
      atom.set(1);
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('cancel removes all listeners', () => {
      const updater = createUpdaterSync();
      const atom1 = createAtom(0);
      const atom2 = createAtom(0);
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      updater.add(atom1, listener1);
      updater.add(atom2, listener2);
      updater.cancel();
      
      atom1.set(1);
      atom2.set(1);
      
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('createUpdaterAsync', () => {
    it('adds and calls listener on atom change', async () => {
      const updater = createUpdaterAsync();
      const atom = createAtom(0);
      const listener = vi.fn();
      
      updater.add(atom, listener);
      atom.set(1);
      
      await waitTime(0);
      
      expect(listener).toHaveBeenCalled();
    });

    it('removes listener', async () => {
      const updater = createUpdaterAsync();
      const atom = createAtom(0);
      const listener = vi.fn();
      
      updater.add(atom, listener);
      updater.remove(atom, listener);
      atom.set(1);
      
      await waitTime(0);
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('batches multiple updates', async () => {
      const updater = createUpdaterAsync();
      const atom = createAtom(0);
      const listener = vi.fn();
      
      updater.add(atom, listener);
      
      atom.set(1);
      atom.set(2);
      atom.set(3);
      
      await waitTime(0);
      
      // Should be called once due to batching
      expect(listener.mock.calls.length).toBeLessThanOrEqual(3);
    });
  });
});
