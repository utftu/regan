import {
  VNew,
  VNewElement,
  VNewText,
  VOld,
  VOldElement,
  VOldText,
} from './types.ts';

export const convertTextNewToOld = (
  vNew: VNewText,
  textNode: Text
): VOldText => {
  const vOld = vNew as VOldText;

  vOld.textNode = textNode;
  vOld.init?.(vOld);

  return vOld;
};

export const convertElementNewToOld = (
  vNew: VNewElement,
  element: Element
): VOldElement => {
  const vOld = vNew as VOldElement;

  vOld.element = element;
  vOld.init?.(vOld);

  return vOld;
};

export function convertFromNewToOld(vNew: VNewText, domNode: Node): VOldText;
export function convertFromNewToOld(
  vNew: VNewElement,
  domNode: Node
): VOldElement;

// @ts-expect-error
export function convertFromNewToOld(vNew: VNew, domNode: Node): VOld {
  if (vNew.type === 'text') {
    return convertTextNewToOld(vNew, domNode as Text);
  } else if (vNew.type === 'element') {
    return convertElementNewToOld(vNew, domNode as Element);
  }
}
