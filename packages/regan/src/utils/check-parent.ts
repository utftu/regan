import type {ErrorRegan} from '../errors/errors.tsx';
import type {HNodeComponent} from '../h-node/component.ts';
import type {HNodeElement} from '../h-node/element.ts';
import type {HNode} from '../h-node/h-node.ts';
import type {HNodeText} from '../h-node/text.ts';
import type {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import type {JsxNode} from '../regan.ts';

const key = '_regan_name';

const getChildName = (name: Name) => {
  return `${key}_${name}`;
};

type Types = {
  hNode: HNode;
  hNodeElement: HNodeElement;
  hNodeText: HNodeText;
  hNodeComponent: HNodeComponent;
  errorRegan: ErrorRegan;
  jsxNodeComponent: JsxNodeComponent;
  jsxNode: JsxNode;
};

type Name = keyof Types;

export const defineClassName = (ent: any, name: Name) => {
  Object.defineProperty(ent.prototype, key, {
    value: name,
    enumerable: false,
    writable: false,
    configurable: false,
  });

  const childName = getChildName(name);

  Object.defineProperty(ent.prototype, childName, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });
};

// export const checkClassInstance = <T extends Name>(
//   ent: unknown,
//   name: T
// ): ent is Types[T] => {
//   return typeof ent === 'object' && ent !== null && (ent as any)[key] === name;
// };

export const checkClassChild = <T extends Name>(
  ent: unknown,
  name: T
): ent is Types[T] => {
  const childName = getChildName(name);
  return (
    typeof ent === 'object' && ent !== null && (ent as any)[childName] === true
  );
};
