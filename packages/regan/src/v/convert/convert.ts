import {Atom} from 'strangelove';
import {TreeAtomsSnapshot} from '../../tree-atoms-snapshot/tree-atoms-snapshot.ts';

export const splitProps = (
  props: Record<string, any>,
  treeAtomsSnapshot: TreeAtomsSnapshot
) => {
  const joinedProps: Record<string, any> = {};
  const dynamicProps: Record<string, any> = {};
  const staticProps: Record<string, any> = {};

  for (const key in props) {
    const value = props[key];
    if (value instanceof Atom) {
      const atomValue = treeAtomsSnapshot.getValue(value);
      joinedProps[key] = atomValue;
      dynamicProps[key] = value;
    } else {
      staticProps[key] = props[key];
    }
  }

  return {joinedProps, dynamicProps, staticProps};
};
