import {Atom} from 'strangelove';
import {HNodeElement} from '../h-node/element.ts';
import {HNode} from '../h-node/h-node.ts';
import {HNodeText} from '../h-node/text.ts';
import {HNodeElementToReplace, HNodeVText} from './h-node.ts';
import {VElementNew, VNew, VTextNew} from './new.ts';

type ConvertStore = {lastVNode?: VNew};

const prepareProps = (props: Record<string, any>) => {
  const preparedProps: Record<string, any> = {};

  for (const name in props) {
    const value = props[name];

    if (value instanceof Atom) {
      preparedProps[name] = value.get();
    } else {
      preparedProps[name] = value;
    }
  }

  return preparedProps;
};

const createVNodeText = (hNode: HNodeText): VTextNew => {
  return {
    type: 'text',
    text: hNode.text,
    start: hNode.start,
  };
};

const createVNodeEl = (
  hNode: HNodeElement | HNodeElementToReplace
): VElementNew => {
  const vElement = {
    type: 'el',
    props: prepareProps(hNode.jsxNode.props),
    tag: hNode.jsxNode.type,
    children: [],
  } satisfies VElementNew;

  if (hNode instanceof HNodeElementToReplace) {
    // @ts-ignore
    vElement.init = hNode.init;
  }

  return vElement;
};

export const convert = (
  hNode: HNode,
  store: ConvertStore = {}
): VNew[] | void => {
  if (hNode instanceof HNodeText) {
    if (store.lastVNode?.type === 'text') {
      store.lastVNode.text += hNode.text;
      return;
    }
    const newVNode = createVNodeText(hNode);
    store.lastVNode = newVNode;
    return [newVNode];
  }
  if (hNode instanceof HNodeElement || hNode instanceof HNodeElementToReplace) {
    const newVNode = createVNodeEl(hNode);
    store.lastVNode = newVNode;
    return [newVNode];
  }

  return hNode.children.reduce((localStore, childHNode) => {
    const result = convert(childHNode, store);

    if (!result) {
      return localStore;
    }

    localStore.push(...result);

    return localStore;
  }, [] as VNew[]);
};
