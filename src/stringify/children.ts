import {SegmentEnt} from '../segment/segment.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {walkChildren} from '../jsx-node/children.ts';
import {StringifyProps, StringifyResult} from './types.ts';
import {GlobalCtxServer, AreaCtx} from '../ctx/global.ts';
import {stringifyElement} from './element.ts';
import {stringifyComponent} from './component.ts';
import {SingleChild} from '../types.ts';
import {textSeparator} from '../consts.ts';

// Что делать с узлом, решает его вид — методов у него больше нет.
export function stringifyJsxNode(
  jsxNode: JsxNode,
  props: StringifyProps
): StringifyResult {
  if (jsxNode.type === 'element') {
    return stringifyElement(jsxNode, props);
  }

  return stringifyComponent(jsxNode, props);
}

export type HandleChildrenStringifyResult = {
  text: string;
  lastText: boolean;
};

export function handleChildrenString({
  children,
  parentSegmentEnt,
  globalCtx,
  areaCtx,
  lastText: propsLastText,
}: {
  children: SingleChild[];
  parentSegmentEnt: SegmentEnt;
  globalCtx: GlobalCtxServer;
  areaCtx: AreaCtx;
  lastText: boolean;
}): HandleChildrenStringifyResult {
  const strings: string[] = [];
  let lastText = propsLastText;

  walkChildren({
    children,
    parentSegmentEnt,
    text: (text) => {
      // два текста подряд браузер склеит в один узел — разделяем комментарием,
      // гидратация его уберёт
      if (lastText === true) {
        strings.push(textSeparator);
      }

      strings.push(text);
      lastText = true;
    },
    node: (jsxNode, jsxSegmentName) => {
      const result = stringifyJsxNode(jsxNode, {
        globalCtx,
  areaCtx,
        jsxSegmentName,
        parentSegmentEnt,
        lastText,
      });

      strings.push(result.text);
      lastText = result.lastText;
    },
  });

  return {text: strings.join(''), lastText};
}
