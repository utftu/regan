import {defineClassName} from '../utils/check-parent.ts';
import {LisneterManager} from '../utils/listeners.ts';
import {VOldElement} from '../v/types.ts';
import {HNode, PropsHNode} from './h-node.ts';

type HNodeElProps = {
  element: Element;
  listenerManager: LisneterManager;
};

export class HNodeElement extends HNode {
  element: Element;
  listenerManager: LisneterManager;
  constructor(props: PropsHNode, {element, listenerManager}: HNodeElProps) {
    super(props);
    this.element = element;
    this.listenerManager = listenerManager;
  }

  vOldElement?: VOldElement;
}
defineClassName(HNodeElement, 'hNodeElement');
