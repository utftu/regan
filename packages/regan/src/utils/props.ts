import {Atom, checkAtom} from 'strangelove';
import {AnyFunc, Props} from '../types.ts';
import {LisneterManager} from './listeners.ts';
import {HNodeElement} from '../h-node/element.ts';
import {subsribeAtomStages} from './atom.ts';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';

export const splitProps = (props: Props) => {
  const joinedProps: Props = {};
  const dynamicProps: Props = {};
  const staticProps: Props = {};

  for (const key in props) {
    const value = props[key];
    if (checkAtom(value)) {
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

export const initStaticProps = (
  element: Element,
  staticProps: Props,
  listenerManager: LisneterManager
) => {
  for (const name in staticProps) {
    const value = staticProps[name];

    setProperty({name, value, element, listenerManager});
  }
};

export const initDynamicPropsStage0 = ({
  dynamicProps,
  globalCtx,
}: {
  dynamicProps: Props;
  globalCtx: GlobalCtx;
}) => {
  const subsribers: Record<string, {subscriber: AnyFunc; atom: Atom}> = {};
  for (const name in dynamicProps) {
    const atom = dynamicProps[name];

    const subscriber = subsribeAtomStages({
      atom,
      globalCtx,
    });

    subsribers[name] = {subscriber, atom};
  }

  return function initDynamicPropsStage1(
    hNode: HNodeElement,
    listenerManager: LisneterManager
  ) {
    for (const name in subsribers) {
      const {subscriber: subsriber, atom} = subsribers[name];
      subsriber(hNode, () => {
        setProperty({
          name,
          value: atom.get(),
          element: hNode.element,
          listenerManager,
        });

        if (hNode.vOldElement) {
          hNode.vOldElement.data.props[name] = atom.get();
        }
      });
    }
  };
};
