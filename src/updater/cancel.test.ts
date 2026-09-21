import {describe, expect, it, vi} from 'bun:test';
import {createAtom} from 'strangelove';
import {waitTime} from 'utftu';
import {createUpdaterAsync, createUpdaterSync} from './updater.ts';

describe('updater', () => {
  it('cancel отменяет запланированный пакет', async () => {
    const updater = createUpdaterAsync();
    const atom = createAtom(0);
    const func = vi.fn();

    updater.add(atom, func);
    atom.set(1);
    updater.updaterTask.cancel();

    await waitTime(0);

    expect(func).not.toHaveBeenCalled();
  });

  it('cancel снимает подписки со всех атомов', async () => {
    const updater = createUpdaterAsync();
    const atom = createAtom(0);
    const func = vi.fn();

    updater.add(atom, func);
    updater.cancel();

    atom.set(1);
    await waitTime(0);

    expect(func).not.toHaveBeenCalled();
  });

  it('синхронный апдейтер выполняет сразу, без микротаска', () => {
    const updater = createUpdaterSync();
    const atom = createAtom(0);
    const func = vi.fn();

    updater.add(atom, func);
    atom.set(1);

    expect(func).toHaveBeenCalledTimes(1);
  });

  it('падение одного обновления не мешает остальным', async () => {
    const updater = createUpdaterAsync();
    const atom = createAtom(0);
    const second = vi.fn();
    const failing = () => {
      throw new Error('бум');
    };

    const reported: unknown[] = [];
    const original = globalThis.reportError;
    globalThis.reportError = (error: unknown) => reported.push(error);

    try {
      updater.add(atom, failing);
      updater.add(atom, second);

      atom.set(1);
      await waitTime(0);

      expect(second).toHaveBeenCalledTimes(1);
      expect(reported).toHaveLength(1);

      // апдейтер не встал: следующее обновление проходит
      const third = vi.fn();
      updater.remove(atom, failing);
      updater.add(atom, third);

      atom.set(2);
      await waitTime(0);

      expect(third).toHaveBeenCalledTimes(1);
      expect(reported).toHaveLength(1);
    } finally {
      globalThis.reportError = original;
    }
  });
});
