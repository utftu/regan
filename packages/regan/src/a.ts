import {HNodeText} from './h-node/text.ts';

class TextManager {
  textNode: Text;
  hNodeTexts: HNodeText[] = [];

  constructor(textNode: Text) {
    this.textNode = textNode;
  }

  addHNodeText(hNodeText: HNodeText) {}
}
