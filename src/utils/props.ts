import {checkAtom, checkIon} from 'strangelove';
import {Props} from '../types.ts';
import {ListenerManager} from './listeners.ts';
import {HNodeElement} from '../h-node/element.ts';
import {GlobalCtx} from '../ctx/global.ts';
import {MountUnmounFunc} from '../h-node/h-node.ts';
import {
  checkDomProperty,
  getAttributeValue,
  getPropertyEvent,
  setDomProperty,
} from './attributes.ts';
import {checkUnbind} from './bind.ts';

export const splitProps = (props: Props) => {
  const joinedProps: Props = {};
  const dynamicProps: Props = {};
  const staticProps: Props = {};
  // кандидаты на обратную запись: источники, кроме завёрнутых в unbind
  const bindProps: Props = {};

  for (const key in props) {
    const value = props[key];

    if (checkUnbind(value)) {
      joinedProps[key] = value.atom.get();
      dynamicProps[key] = value.atom;
      continue;
    }

    if (checkIon(value)) {
      joinedProps[key] = value.get();
      dynamicProps[key] = value;

      // Связываем только источник: в результат select писать нечем, у него
      // нет set. Связать выйдет и не всякий проп — управляемые перечислены
      // в таблице свойств, а проверить это можно, лишь зная элемент,
      // то есть на монтировании.
      if (checkAtom(value)) {
        bindProps[key] = value;
      }

      continue;
    }

    staticProps[key] = value;
    joinedProps[key] = value;
  }

  return {joinedProps, dynamicProps, staticProps, bindProps};
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

  if (checkDomProperty(element, name)) {
    setDomProperty(element, name, value);
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

// Обратная сторона связки: пользователь изменил элемент — кладём значение
// в атом. Подписка наоборот, атом в элемент, уже сделана выше.
//
// Слушатель вешается отдельно от пользовательских: у ListenerManager на имя
// события ровно один обработчик, и свой input={...} иначе вытеснил бы этот.
// Пользовательский при этом срабатывает первым, поэтому читать в нём надо
// element, а не атом.
export const subscribeBindProps = ({
  bindProps,
  mounts,
}: {
  bindProps: Props;
  mounts: MountUnmounFunc[];
}) => {
  for (const name in bindProps) {
    const atom = bindProps[name];

    mounts.push((hNode) => {
      const element = (hNode as HNodeElement).element;

      if (checkDomProperty(element, name) === false) {
        return;
      }

      const listener = () => {
        atom.set((element as any)[name]);
      };
      const event = getPropertyEvent(element, name);

      element.addEventListener(event, listener);
      hNode.unmounts.push(() => {
        element.removeEventListener(event, listener);
      });
    });
  }
};
