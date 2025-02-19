import {Atom} from 'strangelove';
import {prepareListenerForError} from '../../errors/utils.ts';
import {SegmentEnt} from '../../segments/ent/ent.ts';
import {ContextEnt} from '../../context/context.tsx';
import {AnyFunc} from '../../types.ts';
import {LisneterManager} from './funcs.ts';

export const createExec = ({
  name,
  element,

  listenerManager,
}: {
  name: string;
  element: Element;
  listenerManager: LisneterManager;
}) => {
  const exec = (value: any) => {
    listenerManager.remove(element, name);

    if (typeof value === 'function') {
      listenerManager.add(element, name, value);
    } else {
      element.setAttribute(name, value);
    }
  };
  return exec;
};
