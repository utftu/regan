function djb2Hash(str: string): number {
  let hash = 5381; // Начальное значение, используемое в djb2
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i); // Получаем код символа
    hash = hash * 33 + char; // Умножение на 33 и добавление текущего символа
  }
  return hash >>> 0; // Приводим к беззнаковому 32-битному целому числу
}

// Пример использования:
const result = djb2Hash('example');
console.log(result); // Выведет хэш строки "example"
