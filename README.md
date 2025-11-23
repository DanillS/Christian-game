# Рождественские Тайны

Интерактивная христианская игра-викторина для празднования Рождества Христова.

## Установка

```bash
npm install
```

## Запуск

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Структура проекта

- `app/` - страницы Next.js
- `components/` - React компоненты
- `data/` - файлы данных для раундов:
  - `guessFaceData.ts` - вопросы для "Угадай Лицо"
  - `guessMelodyData.ts` - вопросы для "Угадай Мелодию"
  - `bibleQuotesData.ts` - вопросы для "Библейские Цитаты"
  - `guessVoiceData.ts` - вопросы для "Угадай, Кто Говорит"

## Добавление контента

### Иконки раундов
Поместите иконки в папку `public/icons/`:
- `guess-face.png`
- `guess-melody.png`
- `bible-quotes.png`
- `guess-voice.png`

### Фотографии для "Угадай Лицо"
Поместите фотографии в `public/images/faces/` и укажите пути в `data/guessFaceData.ts`

### Аудиофайлы
- Мелодии: `public/audio/melodies/`
- Голоса: `public/audio/voices/`

## Деплой на Vercel

1. Подключите репозиторий к Vercel
2. Vercel автоматически определит Next.js проект
3. Нажмите Deploy

