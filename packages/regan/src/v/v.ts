import {apply} from './apply/apply.ts';
import {diffOne} from './diff/diff.ts';
import {VNew} from './new.ts';
import {VOld} from './old.ts';

export type Control = {
  addNode: (node: Node) => void;
};

const virtualApply = ({
  vNews,
  vOlds,
  window,
  control,
}: {
  vNews: VNew[];
  vOlds: VOld[];
  window: Window;
  control: Control;
}) => {
  for (let i = 0; i <= Math.max(vNews.length, vOlds.length); i++) {
    const vNew = vNews[i];
    const vOld = vOlds[i];
    const event = diffOne(vNews[i], vOlds[i]);

    const node = apply({vNew, vOld, window, event, control});

    if (vNew) {
      (vNew as VOld).domNode = node!;
    }

    if (vNew.type === 'element' || vOld.type === 'element') {
      virtualApply({
        vNews: vNew.type === 'element' ? vNew.children : [],
        vOlds: vOld.type === 'element' ? vOld.children : [],
        window,
        control: {
          addNode: (node) => {
            // we sure that vNew exist and is element, because if vNew doesn't exist we emit delete
            const vNewAsOld = vNew as VOld;
            if (vNewAsOld.type === 'element') {
              vNewAsOld.domNode.appendChild(node);
            }
          },
        },
      });
    }
  }
};
