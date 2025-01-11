import {Atom} from 'strangelove';
import {prepareListenerForError} from '../../errors/utils.ts';
import {SegmentEnt} from '../../segments/ent/ent.ts';
import {ContextEnt} from '../../context/context.tsx';
import {AynFunc} from '../../types.ts';

export const createExec = ({
  name,
  element,
  atom,
  segmentEnt,
  contextEnt,
}: {
  name: string;
  element: Element;
  segmentEnt: SegmentEnt;
  contextEnt?: ContextEnt;
  atom: Atom;
}) => {
  const item: {listener?: AynFunc} = {};
  if (typeof atom.get() === 'function') {
    item.listener = atom.get();
  }

  const exec = (value: any) => {
    if (item.listener) {
      element.removeEventListener(name, item.listener);
      delete item.listener;
    }

    if (typeof value === 'function') {
      const listener = prepareListenerForError({
        listener: value,
        segmentEnt,
        contextEnt,
      });

      element.addEventListener(name, listener);
      item.listener = listener;
    } else {
      element.setAttribute(name, value);
    }
  };
  return exec;
};
