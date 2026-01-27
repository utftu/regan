import {defineClassName} from '../utils/check-parent.ts';
import {ListenerManager} from '../utils/listeners.ts';
import {VOldElement} from '../v/types.ts';
import {HNode, PropsHNode} from './h-node.ts';

type HNodeElProps = {
  element: Element;
  listenerManager: ListenerManager;
};

export class HNodeElement extends HNode {
  element: Element;
  listenerManager: ListenerManager;
  constructor(props: PropsHNode, {element, listenerManager}: HNodeElProps) {
    super(props);
    this.element = element;
    this.listenerManager = listenerManager;
  }

  unmount() {
    // Cleanup listeners before unmounting
    this.listenerManager.cleanup();
    super.unmount();
  }

  vOldElement?: VOldElement;
}
defineClassName(HNodeElement, 'hNodeElement');
