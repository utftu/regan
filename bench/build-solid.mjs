// Solid без своего babel-плагина не работает: JSX превращается в template() +
// cloneNode на этапе сборки. Компилируем его приложение перед замером.
import {transformFileAsync} from '@babel/core';
import {writeFile} from 'node:fs/promises';

const result = await transformFileAsync('./solid-app.jsx', {
  presets: [['babel-preset-solid', {}]],
  filename: 'solid-app.jsx',
});

await writeFile('./solid-app.mjs', result.code);

console.log('solid-app.mjs собран');
