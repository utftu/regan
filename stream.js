const childStreams = new TransformStream();
const parentStreams = new TransformStream();

const writer = parentStreams.writable.getWriter();
// const writer2 = parentStreams.writable.getWriter()

setTimeout(async () => {
  console.log('-----', '123', 123);
  // parentStreams.writable.close();
  writer.write('hello');
  await writer.close();
  // console.log('-----', 'parentStreams', parentStreams);
  // console.log('-----', 'childStreams', childStreams);
}, 1000);

console.log('-----', 'parentStreams.writable', parentStreams.writable);
await parentStreams.readable.pipeTo(childStreams.writable);

const reader = childStreams.readable.getReader();

while (true) {
  console.log('-----', '1', 1);
  const {value, done} = await reader.read();

  if (done) {
    break;
  }
  console.log('-----', 'value', value);
}
