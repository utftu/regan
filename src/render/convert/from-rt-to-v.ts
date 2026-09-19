import {AnyFunc} from '../../types.ts';
import {
  VNew,
  VNewElement,
  VNewText,
  VOldElement,
  VOldText,
} from '../../v/types.ts';
import {
  RenderT,
  RenderTemplateElementExtended,
  RenderTemplateTextExtended,
} from '../template.types.ts';

const wrapMethod = (obj: Record<string, any>, name: string, fn: AnyFunc) => {
  const oldFunc = obj[name];

  obj[name] = (...args: any[]) => {
    oldFunc?.call(obj, ...args);
    fn.call(obj, ...args);
  };
};

export const convertFromRtToV = (renderTemplate: RenderT): VNew[] => {
  if (renderTemplate.type === 'text') {
    const vNew: VNewText = {
      ...renderTemplate.vNew,
    };

    wrapMethod(vNew, 'init', (vOld: VOldText) => {
      const renderTemplateExtended =
        renderTemplate as RenderTemplateTextExtended;
      renderTemplateExtended.vOld = vOld;
    });

    return [vNew];
  }

  if (renderTemplate.type === 'element') {
    const children = renderTemplate.children
      .map((renderTemplate) => convertFromRtToV(renderTemplate))
      .flat();

    const vNewResult: VNewElement = {
      ...renderTemplate.vNew,
      children,
    };

    wrapMethod(vNewResult, 'init', (vOld: VOldElement) => {
      const renderTemplateExtended =
        renderTemplate as RenderTemplateElementExtended;
      renderTemplateExtended.vOld = vOld;
    });

    return [vNewResult];
  }

  if (renderTemplate.type === 'component') {
    const children = renderTemplate.children
      .map((renderTemplate) => convertFromRtToV(renderTemplate))
      .flat();
    return children;
  }

  throw new Error('Unknown renderTemplate type');
};
