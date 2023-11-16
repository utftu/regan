import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {DomProps, JSXNode} from '../node/node.ts';
import {Child} from '../types.ts';
import {SELECT_REGAN_NAMED} from '../atoms/atoms.ts';
import {JSXNodeElement} from '../node/element/element.ts';
import {JSXNodeComponent} from '../node/component/component.ts';
import {HNode} from '../h-node/h-node.ts';
import {DYNAMIC_INSERTED_COUNT, INSERTED_COUNT} from '../consts.ts';
import {joinPath} from '../jsx-path/jsx-path.ts';

export async function handleChildrenHydrate({
  children,
  parentHydratedNode,
  dom,
  globalCtx,
  jsxPath,
}: {
  dom: DomProps;
  children: Child[];
  parentHydratedNode?: HNode;
  globalCtx: GlobalCtx;
  jsxPath: string;
}) {
  const hydrateResults: ReturnType<JSXNode['hydrate']>[] = [];
  let position = dom.position;
  for (let i = 0, jsxNodeCount = 0; i <= children.length; i++) {
    const child = children[i];
    if (!(child instanceof JSXNode) && !(child instanceof Atom)) {
      continue;
    }

    let childNode!: JSXNode;
    let additionalName = '';
    if (child instanceof Atom) {
      let value: any;
      let name: string;
      if ((child as any)[SELECT_REGAN_NAMED]) {
        [name, value] = child.get();
      } else {
        value = child.get();
        name = '0';
      }

      if (value instanceof JSXNode) {
        childNode = value;
        additionalName = `?a=${name}`;
      } else {
        continue;
      }
    } else {
      childNode = child;
    }

    const hydrateResult = childNode.hydrate({
      jsxPath: joinPath(jsxPath, jsxNodeCount.toString()) + additionalName,
      dom: {parent: dom.parent, position},
      parentHydratedNode,
      globalCtx,
    });
    hydrateResults.push(hydrateResult);

    if (childNode instanceof JSXNodeElement) {
      position++;
    } else if (childNode instanceof JSXNodeComponent) {
      if (INSERTED_COUNT in childNode.type) {
        if (childNode.type[INSERTED_COUNT] !== DYNAMIC_INSERTED_COUNT) {
          position += childNode.type[INSERTED_COUNT] as number;
        } else {
          const awaitedhydratedResult = await hydrateResult;
          position += awaitedhydratedResult.insertedCount;
        }
      } else {
        position++;
      }
    }

    jsxNodeCount++;
  }

  const hydrateResultsData = await Promise.all(hydrateResults);

  return {
    insertedCount: position - dom.position,
    hydratedNodes: hydrateResultsData.map(({hydratedNode}) => {
      return hydratedNode;
    }),
  };
}
