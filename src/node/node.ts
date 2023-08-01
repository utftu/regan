type Child = NodeReactNext<any> | string
type Ctx = {}

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

type StringStream = TransformStream<string, string>


export function createElementString({type, props}) {
  const left = `<${type} ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')}>`
  const right = selfClosingTags.includes(type) ? '' : `</${type}>`
  return {left, right}
}

type Component = () => any

class NodeReactNext<TType> {
  type: TType
  key: string
  props: Props
  children: Child[]

  constructor({type, props, key = '', children}: {type: TType, props: Props, key: string, children: Child[]}) {
    this.type = type
    this.key = key
    this.props = props
    this.children = children
  }
  abstract getStringStream(props: {ctx: Ctx}): TransformStream<string, string>
}

type OnFinish = () => void

class NodeReactNextComponent extends NodeReactNext<Component> implements NodeReactNext<Component> {
  getStringStream({ctx}) {

  }
}

async function handleChildren({children, streams, ctx, writer}: {children: Child[], streams: StringStream, onFinish: OnFinish, ctx: Ctx, writer:  WritableStreamDefaultWriter<string>}) {
  const childrenStreams = children.map((child) => {
    if (typeof child === 'string') {
      return child
    }
    return child.getStringStream({ctx})
  })

  for (const childStream of childrenStreams) {
    if (typeof childStream === 'string') {
      writer.write(childStream)
      continue
    }
    await childStream.readable.pipeTo(streams.writable, {preventClose: true})
  }
}

class NodeReactNextElem extends NodeReactNext<string> implements NodeReactNext<string> {
  getStringStream({ctx}: {ctx: Ctx}) {
    const streams = new TransformStream<string, string>()
    const writer = streams.writable.getWriter()

    const elementString = createElementString({type: this.type, props: this.props})
    writer.write(elementString.left)

    Promise.resolve().then(() => {
      await handleChildren({children: this.children, ctx, onFinish: () => {}, streams, writer})
      writer.write(elementString.right)
      writer.close()
    })

    return streams
  }
  getStringStreamOld({ctx}: {ctx: Ctx}) {
    const streams = new TransformStream<string, string>()
    const writer = streams.writable.getWriter()

    const elementString = createElementString({type: this.type, props: this.props})
    writer.write(elementString.left)

    queueMicrotask(async () => {
      const childrenStreams = this.children.map((child) => {
        if (typeof child === 'string') {
          return child
        }
        return child.getStringStream({ctx})
      })

      for (const childStream of childrenStreams) {
        if (typeof childStream === 'string') {
          writer.write(childStream)
          continue
        }
        await childStream.readable.pipeTo(streams.writable, {preventClose: true})
      }
      writer.write(elementString.right)
      writer.close()
    })

    return streams
  }
}


function Button() {
  return <div>hello</div>
}
