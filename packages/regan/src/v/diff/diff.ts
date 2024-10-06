import {Atom} from 'strangelove';
import {VElementNew, VNew, VTextNew} from '../new.ts';
import {VOld} from '../old.ts';

export type EventDiffPatchElement = {
  element: Node;
  type: 'patchElement';
  newProps: Record<string, any>;
  oldProps: Record<string, any>;
};

export type EventDiff =
  | {type: 'delete'}
  | {type: 'create'}
  | {type: 'replaceFull'}
  | {type: 'nextText'}
  | {type: 'replaceText'}
  | EventDiffPatchElement;

export const diffOne = (vNew?: VNew, vOld?: VOld): EventDiff => {
  if (!vNew) {
    return {
      type: 'delete',
    } as const;
  }

  if (!vOld) {
    return {
      type: 'create',
    };
  }

  if (vOld.type !== vNew.type) {
    return {
      type: 'replaceFull',
    };
  }

  if (vOld.type === 'text') {
    if (vOld.text === (vNew as VTextNew).text) {
      return {
        type: 'nextText',
      };
    } else {
      return {
        type: 'replaceText',
      };
    }
  }

  const vNewSure = vNew as VElementNew;
  if (vOld.tag !== vNewSure.tag) {
    return {
      type: 'replaceFull',
    };
  }

  const newProps: Record<string, any> = {};

  for (const key in vNewSure.props) {
    const newValue = vNewSure.props[key];
    const oldValue = vOld.props[key];

    const realNewValue = newValue instanceof Atom ? newValue.get() : newValue;
    const realOldValue = oldValue instanceof Atom ? oldValue.get() : oldValue;

    if (realNewValue === realOldValue) {
      continue;
    }

    newProps[key] = realNewValue;
  }

  const oldProps: Record<string, any> = {};

  for (const key in vOld.props) {
    if (key in vNewSure) {
      continue;
    }
    const oldValue = vOld.props[key];
    const realOldValue = oldValue instanceof Atom ? oldValue.get() : oldValue;

    oldProps[key] = realOldValue;
  }

  return {
    element: vOld.domNode,
    newProps,
    oldProps,
    type: 'patchElement',
  };
};
