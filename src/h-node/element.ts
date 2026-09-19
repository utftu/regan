import {Props} from '../types.ts';
import {defineClassName} from '../utils/check-parent.ts';
import {ListenerManager} from '../utils/listeners.ts';
import {HNode, PropsHNode} from './h-node.ts';

type HNodeElProps = {
  element: Element;
  tag: string;
  props: Props;
  listenerManager: ListenerManager;
};

export class HNodeElement extends HNode {
  element: Element;
  tag: string;
  props: Props;
  listenerManager: ListenerManager;

  constructor(
    hNodeProps: PropsHNode,
    {element, tag, props, listenerManager}: HNodeElProps
  ) {
    super(hNodeProps);
    this.element = element;
    this.tag = tag;
    this.props = props;
    this.listenerManager = listenerManager;
  }

  unmount() {
    this.listenerManager.cleanup();
    super.unmount();
  }
}
defineClassName(HNodeElement, 'hNodeElement');
