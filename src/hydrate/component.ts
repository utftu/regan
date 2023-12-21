import {normalizeChildren} from '../jsx/jsx.ts';
import {JSXNodeComponent} from '../node/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {HydrateProps, destroyAtom} from '../node/node.ts';
import {handleChildrenHydrate} from './children.ts';
import {ComponentState, HNode} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
// import {HNodeElement} from '../h-node/element.ts';

const createSmartMount = (ctx: Ctx) => (hNode: HNode) => {
  const unmounts = ctx.state.mounts.map((mount) => mount());

  hNode.unmounts.push(() => {
    unmounts.forEach((possibleUnmount) => {
      if (typeof possibleUnmount === 'function') {
        possibleUnmount();
      }
    });
    ctx.state.atoms.forEach((possibleAtom) => {
      if (possibleAtom instanceof Promise) {
        possibleAtom.then((atom) => destroyAtom(atom));
      } else {
        destroyAtom(possibleAtom);
      }
    });
  });
};

// function getFirstElem(nodes: HNode[]): HTMLElement | void {
//   for (const node of nodes) {
//     if (node instanceof HNodeElement) {
//       return node.elem;
//     }
//     const elem = getFirstElem(node.children);
//     if (elem) {
//       return elem;
//     }
//   }
// }

// // cut
// function getLastElem(nodes: HNode[]): HTMLElement | void {
//   for (let i = nodes.length; i > 0; i--) {
//     const node = nodes[i];
//     if (node instanceof HNodeElement) {
//       return node.elem;
//     }
//     const elem = getLastElem(node.children);
//     if (elem) {
//       return elem;
//     }
//   }
// }

// export class Elems {
//   first: HTMLElement;
//   last: HTMLElement;

//   constructor(first: HTMLElement, last: HTMLElement) {
//     this.first = first;
//     this.last = last;
//   }
// }

// function getElems(node: HNode) {
//   const first = getFirstElem([node]);
//   if (!first) {
//     return;
//   }
//   const last = getLastElem([node])!;

//   return new Elems(first, last);
// }

// function findPrevElems(positionInChildren: number, parentHNode: HNode) {
//   if (positionInChildren === 0) {
//     return;
//   }

//   for (let i = positionInChildren; i > 0; i--) {
//     const hNode = parentHNode.children[i];

//     const elems = getElems(hNode);

//     if (elems) {
//       return elems;
//     }
//   }
// }

// cut stop

export async function hydrateComponent(
  this: JSXNodeComponent,
  ctx: HydrateProps
) {
  const jsxSegment = new JsxSegment(ctx.jsxSegmentStr, ctx.parentJsxSegment);
  const hNode = new HNode({
    jsxSegment,
    parent: ctx.parentHydratedNode,
    globalCtx: ctx.globalCtx,
  });

  const componentCtx = new Ctx({
    globalCtx: ctx.globalCtx,
    props: this.props,
    state: new ComponentState(),
    children: this.children,
    jsxSegment,
    hNode,
  });

  const rawChidlren = await this.type(this.props, componentCtx);

  const smartMount = createSmartMount(componentCtx);
  hNode.mounts.push(smartMount);

  const children = normalizeChildren(rawChidlren);

  const {insertedCount, hNodes} = await handleChildrenHydrate({
    parentJsxSegment: jsxSegment,
    parentHydratedNode: hNode,
    children,
    dom: ctx.dom,
    globalCtx: ctx.globalCtx,
    hContext: ctx.hContext,
  });

  hNode.addChildren(hNodes);

  return {insertedCount, hNode};
}
