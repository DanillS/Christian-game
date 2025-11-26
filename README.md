# Рождественские Тайны

Интерактивная рождественская игра-викторина на Next.js 14 + TypeScript + Tailwind CSS с атмосферой вертепа, падающим снегом и мерцающими звёздами. В каждом раунде (4 викторины + календарь) можно выбрать уровень сложности, вести счёт, возвращаться обратно и продолжать игру без повторяющихся вопросов.

## Быстрый старт

```bash
npm install
npm run dev
```

## Переменные окружения

Добавьте значения в `.env.local`:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=           # для чтения данных
SUPABASE_SERVICE_ROLE_KEY=   # для записи через бота
SUPABASE_STORAGE_BUCKET=game-content (опционально)
BLOB_READ_WRITE_TOKEN=       # токен Vercel Blob Storage (альтернатива Supabase Storage)
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_PASSWORD=
TELEGRAM_SECRET_TOKEN=       # секрет для вебхука (опционально)
```

**Важно:** Для работы Telegram-бота **обязательно нужна база данных Supabase** (для хранения сессий и вопросов). Vercel Blob Storage используется только для файлов (иконки, фото, аудио).

**Приоритет хранилища файлов:** Если задан `BLOB_READ_WRITE_TOKEN`, используется Vercel Blob Storage. Иначе — Supabase Storage (если настроен).

Если Supabase или Telegram не настроены, приложение продолжит работать на статических файлах из `public/` и `data/*.ts`, но бот работать не будет.

## Supabase

### Хранилище

Создайте bucket (по умолчанию `game-content`) и разрешите public-доступ к объектам. Файлы бот раскладывает так:

- `icons/<round>.png` (или `.jpg`, `.jpeg`)
- `images/faces/<difficulty>/<timestamp>.jpg`
- `audio/melodies/<difficulty>/<timestamp>.mp3`
- `audio/voices/<difficulty>/<timestamp>.mp3`

### Таблицы

```sql
create table public.round_icons (
  round_id text primary key,
  icon_url text not null,
  updated_at timestamptz default now()
);

create table public.admin_sessions (
  telegram_user_id bigint primary key,
  expires_at timestamptz not null
);

create table public.guess_face_questions (
  id bigint generated always as identity primary key,
  difficulty text not null,
  image_url text not null,
  parts jsonb default '["nose","eyes","mouth","hands","full"]',
  options jsonb not null,
  correct_answer text not null,
  created_at timestamptz default now()
);

create table public.guess_melody_questions (
  id bigint generated always as identity primary key,
  difficulty text not null,
  audio_url text not null,
  options jsonb not null,
  correct_answer text not null,
  created_at timestamptz default now()
);

create table public.guess_voice_questions (
  id bigint generated always as identity primary key,
  difficulty text not null,
  audio_url text not null,
  options jsonb not null,
  correct_answer text not null,
  created_at timestamptz default now()
);

create table public.bible_quote_questions (
  id bigint generated always as identity primary key,
  difficulty text not null,
  quote text not null,
  question_type text not null,
  options jsonb not null,
  correct_answer text not null,
  source text,
  created_at timestamptz default now()
);
```

Убедитесь, что таблицы доступны для чтения анонимным ключом, а запись разрешена только сервис-ключу, который используется на сервере (в Telegram боте).

## Телеграм-бот = админ-панель

1. Создайте бота у @BotFather.
2. Настройте вебхук:
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<домен>/api/telegram&secret_token=<TELEGRAM_SECRET_TOKEN>
   ```
3. **Проверьте, что бот работает:**
   - Откройте в браузере: `https://<ваш-домен>/api/telegram`
   - Должен вернуться JSON со статусом всех сервисов
   - Или отправьте `/status` в бот
4. Войдите в панель ботом:
   ```
   /login <пароль из TELEGRAM_ADMIN_PASSWORD>
   ```
5. Используйте команды (все параметры можно отправлять в сообщении или в подписи к файлу):

| Команда                     | Описание                                                                                          | Пример                                                                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/add_icon <roundId>` + изображение | Обновляет иконку раунда (PNG, JPG, JPEG) (`guess-face`, `guess-melody`, `bible-quotes`, `guess-voice`, `calendar`) | `/add_icon guess-face`                                                                                                                                                    |
| `/add_face {json}` + фото   | Добавляет вопрос для "Угадай лицо"                                                                | `/add_face {"difficulty":"easy","options":["Иван","Мария"],"correctAnswer":"Иван","parts":["nose","eyes","mouth","hands","full"]}`                                        |
| `/add_melody {json}` + mp3  | Вопрос для "Угадай мелодию"                                                                       | `/add_melody {"difficulty":"medium","options":["Тихая ночь","Ангелы"],"correctAnswer":"Тихая ночь"}`                                                                      |
| `/add_voice {json}` + mp3   | Вопрос для "Угадай, кто говорит"                                                                  | `/add_voice {"difficulty":"hard","options":["Пастор","Диакон"],"correctAnswer":"Пастор"}`                                                                                 |
| `/add_quote {json}`         | Вопрос для "Библейских цитат"                                                                     | `/add_quote {"difficulty":"easy","quote":"Ибо так возлюбил Бог мир","questionType":"source","options":["Ин 3:16","Мф 5:3"],"correctAnswer":"Ин 3:16","source":"Ин 3:16"}` |
| `/status`                   | Проверка статуса системы                                                                          | `/status`                                                                                                                                                                 |
| `/logout`                   | Завершает сессию                                                                                  | `/logout`                                                                                                                                                                 |

### Отладка бота

Если бот не отвечает:

1. **Проверьте статус через браузер**:

   Откройте в браузере: `https://<ваш-домен>/api/telegram`

   Должен вернуться JSON со статусом всех сервисов.

2. **Проверьте переменные окружения** в Vercel:

   Vercel Dashboard → Settings → Environment Variables:

   - `TELEGRAM_BOT_TOKEN` — должен быть задан
   - `TELEGRAM_ADMIN_PASSWORD` — для входа
   - `BLOB_READ_WRITE_TOKEN` или `SUPABASE_URL` + ключи — для хранения файлов

3. **Проверьте вебхук**:

   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
   ```

   Должен вернуть URL вашего домена.

4. **Проверьте логи в Vercel**:

   **Вариант 1 (через Dashboard):**

   - Vercel Dashboard → ваш проект → вкладка **"Deployments"**
   - Выберите последний deployment → вкладка **"Logs"** или **"Functions"**
   - Ищите записи с префиксом `[Telegram]`

   **Вариант 2 (через CLI):**

   ```bash
   npx vercel logs --follow
   ```

   **Вариант 3 (прямая ссылка):**

   - Vercel Dashboard → ваш проект → боковое меню → **"Logs"**

5. **Используйте `/status`** в боте для проверки конфигурации.

Сессия действует 12 часов. Если Supabase недоступен, бот предупредит, а игра продолжит показывать данные из локальных файлов.

## Ручной режим (fallback)

Если проигрывается сценарий без базы данных, используйте прежний способ:

1. **Иконки раундов** — поместите изображения (PNG, JPG, JPEG) в `public/icons/`:
   - `guess-face.png` (или `.jpg`, `.jpeg`)
   - `guess-melody.png` (или `.jpg`, `.jpeg`)
   - `bible-quotes.png` (или `.jpg`, `.jpeg`)
   - `guess-voice.png` (или `.jpg`, `.jpeg`)
   - `calendar.png` (или `.jpg`, `.jpeg`)
2. **"Угадай лицо"** — фото в `public/images/faces/`, вопросы в `data/guessFaceData.ts`.
3. **"Угадай мелодию"** — MP3 в `public/audio/melodies/`, данные в `data/guessMelodyData.ts`.
4. **"Угадай, кто говорит"** — MP3 в `public/audio/voices/`, вопросы в `data/guessVoiceData.ts`.
5. **"Библейские цитаты"** — редактируйте `data/bibleQuotesData.ts`.

Во всех случаях игра сначала пытается получить данные из Supabase, а при любой ошибке автоматически возвращается к содержимому из `data/*.ts` и файлов `public/`.
