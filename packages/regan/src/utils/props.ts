import {Atom} from 'strangelove';
import {Props} from '../types.ts';
import {LisneterManager} from './listeners.ts';
import {HNodeElement} from '../h-node/element.ts';
import {subsribeAtom} from './atom.ts';
import {AtomsTracker} from '../atoms-tracker/atoms-tracker.ts';

export const splitProps = (props: Props) => {
  const joinedProps: Props = {};
  const dynamicProps: Props = {};
  const staticProps: Props = {};

  for (const key in props) {
    const value = props[key];
    if (value instanceof Atom) {
      joinedProps[key] = value.get();
      dynamicProps[key] = value;
    } else {
      staticProps[key] = props[key];
      joinedProps[key] = props[key];
    }
  }

  return {joinedProps, dynamicProps, staticProps};
};

const setProperty = ({
  name,
  value,
  element,
  listenerManager,
}: {
  name: string;
  value: any;
  element: Element;
  listenerManager: LisneterManager;
}) => {
  if (typeof value === 'function') {
    listenerManager.add(element, name, value);
  } else {
    element.setAttribute(name, value);
  }
};

export const setStaticProps = (
  element: Element,
  staticProps: Props,
  listenerManager: LisneterManager
) => {
  for (const name in staticProps) {
    const value = staticProps[name];

    setProperty({name, value, element, listenerManager});
  }
};

export const planSubsribeDynamic = ({
  dynamicProps,
  hNode,
  listenerManager,
  atomsTracker,
}: {
  dynamicProps: Props;
  hNode: HNodeElement;
  listenerManager: LisneterManager;
  atomsTracker: AtomsTracker;
}) => {
  for (const name in dynamicProps) {
    const atom = dynamicProps[name];

    subsribeAtom({
      hNode,
      atom,
      callback: () => {
        setProperty({
          name,
          value: atom.get(),
          element: hNode.element,
          listenerManager,
        });
      },
      atomsTracker,
    });
  }
};
