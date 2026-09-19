# run-local

Локальный dev-сервер для разработки и тестирования Regan.

## Запуск

```bash
cd packages/run-local
npm run dev
```

## Структура

- `src/run-local.tsx` — точка входа
- `src/module1.tsx` — тестовый модуль
- `src/complex.tsx` — пример с AtomWrapper

## Назначение

Этот пакет используется для:

- Ручного тестирования компонентов
- Отладки SSR/hydration
- Проверки реактивности AtomWrapper
