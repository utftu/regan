export class JSXSegment {
  segment: string;
  parent?: JSXSegment;
  constructor(segment: string, parent?: JSXSegment) {
    this.segment = segment;
    this.parent = parent;
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

    const id = getHashFromString(this.getJsxPath());
    this.idCached = id;
    return id;
  }
}

export function joinPath(oldPart: string, newPart: string) {
  if (newPart === '') {
    return oldPart;
  }
  if (oldPart === '') {
    return newPart;
  }
  return `${oldPart}.${newPart}`;
}

export function getJsxPath(jsxSegment: JSXSegment, childJsxPath: string = '') {
  let jsxPath = joinPath(jsxSegment.segment, childJsxPath);

  if (jsxSegment.parent) {
    return getJsxPath(jsxSegment.parent, jsxPath);
  }
  return jsxPath;
}

export function getHashFromString(str: string) {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash.toString();
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}
