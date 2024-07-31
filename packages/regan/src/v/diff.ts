import {VElementNew, VNew, VTextNew} from './new.ts';

export type EventDiff =
  | {type: 'delete'}
  | {type: 'create'}
  | {type: 'replaceFull'}
  | {type: 'nextText'}
  | {type: 'replaceText'}
  | {
      type: 'childrenEl';
      newProps: Record<string, any>;
      oldProps: Record<string, any>;
    };

// type EventDiff =
//   | {type: 'delete'}
//   | {type: 'create'}
//   | {type: 'replaceFull'}
//   | {type: 'nextText'}
//   | {type: 'replaceText'}
//   | {
//       type: 'elChildren';
//       newProps: Record<string, any>;
//       oldProps: Record<string, any>;
//     };

const diffOne = (vOld?: VNew, vNew?: VNew): EventDiff => {
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
    const attributeNew = vNewSure.props[key];
    const attributeOld = vOld.props[key];

    if (attributeOld === attributeNew) {
      continue;
    }

    newProps[key] = attributeNew;
  }

  const oldProps: Record<string, any> = {};

  for (const key in vOld.props) {
    if (key in vNewSure) {
      continue;
    }

    oldProps[key] = vOld.props[key];
  }

  return {
    newProps,
    oldProps,
    type: 'childrenEl',
  };
};
