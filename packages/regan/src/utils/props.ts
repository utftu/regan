import {Atom, checkAtom} from 'strangelove';
import {AnyFunc, Props} from '../types.ts';
import {ListenerManager} from './listeners.ts';
import {HNodeElement} from '../h-node/element.ts';
import {subscribeAtomStages} from './atom.ts';
import {AreaCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';

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
  listenerManager: ListenerManager;
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
  listenerManager: ListenerManager
) => {
  for (const name in staticProps) {
    const value = staticProps[name];

    setProperty({name, value, element, listenerManager});
  }
};

export const initDynamicPropsStage0 = ({
  dynamicProps,
  globalCtx,
  areaCtx,
}: {
  dynamicProps: Props;
  globalCtx: GlobalCtx;
  areaCtx: AreaCtx;
}) => {
  const subscribers: Record<string, {subscriber: AnyFunc; atom: Atom}> = {};
  for (const name in dynamicProps) {
    const atom = dynamicProps[name];

    const subscriber = subscribeAtomStages({
      atom,
      globalCtx,
      areaCtx,
    });

    subscribers[name] = {subscriber, atom};
  }

  return function initDynamicPropsStage1(
    hNode: HNodeElement,
    listenerManager: ListenerManager
  ) {
    for (const name in subscribers) {
      const {subscriber, atom} = subscribers[name];
      subscriber(hNode, () => {
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
