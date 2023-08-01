type Props = Record<string, any>

function createElement(type: string, props: Record<string, any>, key?: string) {
  const children = Array.isArray(props.children) ? props.children : [props.children]
  return new NodeReactNext({type, props, key, children})
}

const selfClosingTags = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
];


function createElementString({type, props}) {
  const left = `<${type} ${Object.entries(props).map(([key, value]) => `${key}=${value}`).join(' ')}>`
  const right = selfClosingTags.includes(type) ? '' : `</${type}>`
  return {left, right}
}

class NodeReactNext {
  type: string;
  key: string
  props: Props
  children: NodeReactNext[]

  constructor({type, props, key = '', children}: {type: string, props: Props, key: string, children: NodeReactNext[]}) {
    this.type = type
    this.key = key
    this.props = props
    this.children = children
  }

  toStringStream() {

  }
}

function hydrate() {

}