import {Atom, select} from 'strangelove';
import {FC} from '../../types.ts';
import {subscribeAtomChange} from '../../atoms/atoms.ts';
import {HNode} from '../../h-node/h-node.ts';
import {HNodeElement} from '../../h-node/element.ts';

type Props = {
  when: Atom<any>;
};

const findPrevElement = (hNode: HNode) => {
  const parentHNode = hNode.parent;

  if (!parentHNode) {
    return null;
  }

  // todo optimize
  const position = parentHNode.children.indexOf(hNode);
};

const up = (hNodes: HNode[]) => {};

const down = (hNodes: HNode[]): HTMLElement | void => {
  for (let i = hNodes.length; i > 0; i--) {
    const childHNode = hNodes[i];

    if (childHNode instanceof HNodeElement) {
      return childHNode.el;
    }

    const possibleEl = down(childHNode.children);

    if (possibleEl) {
      return possibleEl;
    }
  }
};

export const Show: FC<Props> = (props, ctx) => {
  // const atom = createAtom()

  subscribeAtomChange(props.when, () => {});

  let firstExec = true;
  select((get) => {
    const whenValue = get(props.when);
    if (firstExec === true) {
      firstExec = false;
      return whenValue;
    }
  });

  if (!!props.when.get() === false) {
    return null;
  }
  return ctx.children;
};
