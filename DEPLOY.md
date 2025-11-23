# Инструкция по деплою на Vercel

## Способ 1: Через веб-интерфейс Vercel (Рекомендуется)

### Шаг 1: Подготовка репозитория
1. Создайте репозиторий на GitHub (если еще нет):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ваш-username/Christian-game.git
   git push -u origin main
   ```

### Шаг 2: Деплой на Vercel
1. Зайдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub аккаунт
3. Нажмите "Add New Project"
4. Выберите ваш репозиторий `Christian-game`
5. Vercel автоматически определит:
   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
6. Нажмите "Deploy"
7. Готово! Vercel предоставит вам URL вида `https://your-project.vercel.app`

## Способ 2: Через Vercel CLI

### Установка Vercel CLI
```bash
npm i -g vercel
```

### Деплой
```bash
# В корне проекта
vercel

# Для продакшн деплоя
vercel --prod
```

## Важные моменты

### Переменные окружения
Если в будущем понадобятся переменные окружения, добавьте их в настройках проекта на Vercel:
- Settings → Environment Variables

### Настройки сборки
Vercel автоматически определит Next.js проект, но можно проверить в `vercel.json` (создайте если нужно):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Домены
После деплоя можно:
1. Добавить кастомный домен в Settings → Domains
2. Настроить SSL сертификат (автоматически)

## Проверка после деплоя

1. Откройте предоставленный URL
2. Убедитесь, что все страницы работают
3. Проверьте, что медиафайлы загружаются (если добавлены)

## Обновление приложения

После каждого `git push` в main ветку, Vercel автоматически пересоберет и задеплоит новую версию.

Для ручного деплоя:
```bash
vercel --prod
```


