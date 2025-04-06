import {SegmentEnt} from '../segment.ts';

export class PathSegment {
  systemEnt: SegmentEnt;
  name: string;
  constructor({name, systemEnt}: {name: string; systemEnt: SegmentEnt}) {
    this.name = name;
    this.systemEnt = systemEnt;
  }

  private jsxPathCached: null | string = null;
  getJsxPath() {
    if (this.jsxPathCached !== null) {
      return this.jsxPathCached;
    }
    const jsxPath = getJsxPath(this);
    this.jsxPathCached = jsxPath;
    return jsxPath;
  }

  private idCached: null | string = null;
  getId() {
    if (this.idCached !== null) {
      return this.idCached;
    }

    const id = djb2(this.getJsxPath());
    this.idCached = id;
    return id;
  }

  clearCache() {
    this.jsxPathCached = null;
    this.idCached = null;
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

// export function getHashFromString(str: string) {
//   let hash = 0,
//     i,
//     chr;
//   if (str.length === 0) return hash.toString();
//   for (i = 0; i < str.length; i++) {
//     chr = str.charCodeAt(i);
//     hash = (hash << 5) - hash + chr;
//     hash |= 0; // Convert to 32bit integer
//   }
//   return hash.toString();
// }
