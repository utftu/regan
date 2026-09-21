import {checkAtom} from 'strangelove';
import {Props} from '../types.ts';
import {ListenerManager} from './listeners.ts';
import {HNodeElement} from '../h-node/element.ts';
import {GlobalCtx} from '../ctx/global.ts';
import {MountUnmounFunc} from '../h-node/h-node.ts';
import {getAttributeValue} from './attributes.ts';

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
      staticProps[key] = value;
      joinedProps[key] = value;
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
    return;
  }

  const attributeValue = getAttributeValue(name, value);

  if (attributeValue === undefined) {
    element.removeAttribute(name);
    return;
  }

  element.setAttribute(name, attributeValue);
};

export const initStaticProps = (
  element: Element,
  staticProps: Props,
  listenerManager: ListenerManager,
) => {
  for (const name in staticProps) {
    setProperty({name, value: staticProps[name], element, listenerManager});
  }
};

// Подписка вешается на монтировании: там уже есть и элемент, и hNode.
// Значение применяется сразу, поэтому изменение атома между рендером
// и монтированием не теряется — отдельная стадия для этого не нужна.
export const subscribeDynamicProps = ({
  dynamicProps,
  mounts,
  globalCtx,
  listenerManager,
}: {
  dynamicProps: Props;
  mounts: MountUnmounFunc[];
  globalCtx: GlobalCtx;
  listenerManager: ListenerManager;
}) => {
  for (const name in dynamicProps) {
    const atom = dynamicProps[name];

    mounts.push((hNode) => {
      const hNodeElement = hNode as HNodeElement;

      const update = () => {
        const value = atom.get();

        setProperty({
          name,
          value,
          element: hNodeElement.element,
          listenerManager,
        });
        hNodeElement.props[name] = value;
      };

      update();

      globalCtx.updater.add(atom, update);
      hNodeElement.unmounts.push(() => {
        globalCtx.updater.remove(atom, update);
      });
    });
  }
};
