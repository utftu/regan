import {SegmentEnt} from '../segment.ts';

export class PathSegment {
  systemEnt: SegmentEnt;
  name: string;
  constructor({name, systemEnt}: {name: string; systemEnt: SegmentEnt}) {
    this.name = name;
    this.systemEnt = systemEnt;
  }

  // Путь считается каждый раз заново, по живой цепочке родителей.
  // Кэшировать его нельзя: сохранённое поддерево переезжает вместе с
  // ключом, и закэшированный путь тут же перестаёт быть правдой.
  getJsxPath() {
    return getJsxPath(this);
  }

  getId() {
    return djb2(this.getJsxPath());
  }
}

export function getJsxPath(jsxSegment: PathSegment, childJsxPath: string = '') {
  let jsxPath = joinPath(jsxSegment.name, childJsxPath);

  if (jsxSegment.systemEnt.parentSegmentEnt) {
    return getJsxPath(
      jsxSegment.systemEnt.parentSegmentEnt.pathSegment,
      jsxPath
    );
  }
  return jsxPath;
}

export function joinPath(oldPart: string = '', newPart: string = '') {
  if (newPart === '') {
    return oldPart;
  }
  if (oldPart === '') {
    return newPart;
  }
  return `${oldPart}.${newPart}`;
}

export function djb2(str: string) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(); // Убираем знак, возвращаем положительное число
}
