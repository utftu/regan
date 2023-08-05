const childStreams = new TransformStream();
const parentStreams = new TransformStream();

function log(name) {
  console.log('-----', 'name', name);
  console.log('-----', 'parentStreams', parentStreams);
  console.log('-----', 'childStreams', childStreams);
}

log('init');

const writerParent = parentStreams.writable.getWriter();

log('parent wiriter');

// // // setTimeout(async () => {
// // await writerParent.write('hello');
// // console.log('-----', '1234', 1234);
// // await writerParent.write('world');
// // await writerParent.close();
// // // }, 1000);

const writerChild = childStreams.writable.getWriter();

log('child writer');

parentStreams.readable.pipeTo(childStreams.writable);

// writerChild.write('child');

// const reader = childStreams.readable.getReader();

// while (true) {
//   const {value, done} = await reader.read();

//   if (done) {
//     break;
//   }
//   console.log('-----', 'value', value);
// }
