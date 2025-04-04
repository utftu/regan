import {AnyFunc} from '../../types.ts';
import {
  VNew,
  VNewElement,
  VNewText,
  VOldElement,
  VOldText,
} from '../../v/types.ts';
import {
  RenderTemplate,
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

export const convertFromRtToV = (
  renderTemplate: RenderTemplate,
  store: {vNew?: VNewText} = {}
): VNew[] => {
  if (renderTemplate.type === 'text') {
    const vNewExist = !!store.vNew;

    if (!store.vNew) {
      store.vNew = {
        ...renderTemplate.vNew,
      };
    } else {
      store.vNew.data.text += renderTemplate.vNew.data.text;
    }

    const vNew = store.vNew;

    wrapMethod(vNew, 'init', (vOld: VOldText) => {
      const renderTemplateExtended =
        renderTemplate as RenderTemplateTextExtended;
      renderTemplateExtended.vOld = vOld;
    });

    if (!vNewExist) {
      return [vNew];
    }

    return [];
  }
  if (renderTemplate.type === 'element') {
    store.vNew = undefined;
    const children = renderTemplate.children
      .map((renderTemplate) => convertFromRtToV(renderTemplate, store))
      .flat();
    store.vNew = undefined;

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
      .map((renderTemplate) => convertFromRtToV(renderTemplate, store))
      .flat();
    return children;
  }

  throw new Error('Unknown renderTemplate type');
};
