const parentTransform = new TransformStream()
export const childStransform = new TransformStream()

const writer = childStransform.writable.getWriter();
// const writer2 = childStransform.writable.getWriter();
writer.write('hello')
writer.close()
// childStransform.writable.close()
// console.log('-----', 'childStransform.writable');
childStransform.readable.pipeTo(parentTransform.writable, 
  {preventClose: true}
  )

// setTimeout(() => {
//   parentTransform.writable.close()
// }, 1000) 


for await (const data of parentTransform.readable.values()) {
  console.log('-----', '123', data);
}

console.log('-----', 'child', childStransform.readable);