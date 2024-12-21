function djb2Hash(str: string): number {
  let hash = 1;
  // let hash = 5381; // Начальное значение, используемое в djb2
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i); // Получаем код символа
    console.log('-----', 'oldHash', hash);
    console.log('-----', 'char', char);
    hash = hash * 33 + char;
  }
  console.log('-----', 'after hash', hash);
  return hash >>> 0; // Приводим к беззнаковому 32-битному целому числу
}

// Пример использования:
const result = djb2Hash('aa');
console.log(result); // Выведет хэш строки "example"
