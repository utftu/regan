import {Atom} from 'strangelove';
import {HNodeElement} from '../../h-node/element.ts';
import {subscribeAtom} from './atom.ts';
import {createExec} from './exec.ts';
import {LisneterManager} from './funcs.ts';

type DynamicProps = Record<string, Atom>;

export const initDynamicSubsribes = ({
  dynamicProps,
  hNode,
  listenerManager,
}: {
  dynamicProps: DynamicProps;
  hNode: HNodeElement;
  listenerManager: LisneterManager;
}) => {
  for (const name in dynamicProps) {
    const atom = dynamicProps[name];

    subscribeAtom({
      exec: createExec({
        element: hNode.element,
        name,
        listenerManager,
      }),
      hNode,
      atom,
    });
  }
};
