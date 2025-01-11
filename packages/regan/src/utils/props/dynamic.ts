import {Atom} from 'strangelove';
import {HNodeElement} from '../../h-node/element.ts';
import {subscribeAtom} from './atom.ts';
import {createExec} from './exec.ts';

type DynamicProps = Record<string, Atom>;

export const initDynamicSubsribes = ({
  dynamicProps,
  hNode,
}: {
  dynamicProps: DynamicProps;
  hNode: HNodeElement;
}) => {
  for (const name in dynamicProps) {
    const atom = dynamicProps[name];

    subscribeAtom({
      tempExec: () => {},
      exec: createExec({
        element: hNode.element,
        name,
        segmentEnt: hNode.segmentEnt,
        contextEnt: hNode.contextEnt,
        atom,
      }),
      hNode,
      atom,
    });
  }
};
