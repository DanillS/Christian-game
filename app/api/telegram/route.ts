import { NextResponse } from 'next/server'
import { Buffer } from 'node:buffer'
import {
  isSupabaseEnabled,
  isVercelBlobEnabled,
  supabaseDelete,
  supabaseRestRequest,
  supabaseStorageUpload,
} from '@/lib/server/supabaseClient'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_ADMIN_PASSWORD = process.env.TELEGRAM_ADMIN_PASSWORD || ''
const TELEGRAM_SECRET_TOKEN = process.env.TELEGRAM_SECRET_TOKEN || ''

const ROUND_ICON_IDS = ['guess-face', 'guess-melody', 'bible-quotes', 'guess-voice', 'calendar']

interface TelegramUser {
  id: number
  username?: string
  first_name?: string
  last_name?: string
}

interface TelegramChat {
  id: number
}

interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  chat: TelegramChat
  text?: string
  caption?: string
  photo?: { file_id: string }[]
  document?: { file_id: string; mime_type?: string; file_name?: string } | null
  audio?: { file_id: string; mime_type?: string; file_name?: string } | null
  voice?: { file_id: string; mime_type?: string } | null
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  edited_message?: TelegramMessage
}

export async function GET() {
  // GET endpoint для проверки статуса бота через браузер
  return NextResponse.json({
    status: 'ok',
    bot_configured: Boolean(TELEGRAM_BOT_TOKEN),
    supabase_configured: isSupabaseEnabled(),
    vercel_blob_configured: isVercelBlobEnabled(),
    admin_password_set: Boolean(TELEGRAM_ADMIN_PASSWORD),
    secret_token_set: Boolean(TELEGRAM_SECRET_TOKEN),
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: Request) {
  console.log('[Telegram] Получен запрос')
  
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('[Telegram] Не задан TELEGRAM_BOT_TOKEN, бот недоступен')
    return NextResponse.json({ ok: true, error: 'TELEGRAM_BOT_TOKEN not set' })
  }

  if (TELEGRAM_SECRET_TOKEN) {
    const secret = request.headers.get('x-telegram-bot-api-secret-token')
    if (secret !== TELEGRAM_SECRET_TOKEN) {
      console.error('[Telegram] Неверный secret token')
      return new Response('Unauthorized', { status: 401 })
    }
  }

  try {
    const update: TelegramUpdate = await request.json()
    console.log('[Telegram] Обработка update:', update.update_id)
    await processUpdate(update)
  } catch (error) {
    console.error('[Telegram] Ошибка обработки вебхука', error)
    if (error instanceof Error) {
      console.error('[Telegram] Stack:', error.stack)
    }
  }

  return NextResponse.json({ ok: true })
}

async function processUpdate(update: TelegramUpdate) {
  const message = update.message || update.edited_message
  if (!message) {
    console.log('[Telegram] Нет message в update')
    return
  }

  const chatId = message.chat.id
  const text = (message.text || message.caption || '').trim()
  console.log('[Telegram] Сообщение от', chatId, 'текст:', text.substring(0, 100))

  if (!text.startsWith('/')) {
    await sendTelegramMessage(chatId, 'Отправьте команду. Используйте /help для подсказки.')
    return
  }

  const { command, payload } = splitCommand(text)
  console.log('[Telegram] Команда:', command, 'payload:', payload.substring(0, 50))

  switch (command) {
    case '/start':
      await sendTelegramMessage(chatId, getWelcomeText())
      break
    case '/help':
      await sendTelegramMessage(chatId, getHelpText())
      break
    case '/status':
      await handleStatus(chatId)
      break
    case '/login':
      await handleLogin(message, payload)
      break
    case '/logout':
      await handleLogout(message)
      break
    case '/add_icon':
      await handleAddIcon(message, payload)
      break
    case '/add_face':
      await handleAddFace(message, payload)
      break
    case '/add_melody':
      await handleAddAudio(message, payload, 'guess_melody_questions', 'audio/melodies')
      break
    case '/add_voice':
      await handleAddAudio(message, payload, 'guess_voice_questions', 'audio/voices')
      break
    case '/add_quote':
      await handleAddQuote(message, payload)
      break
    default:
      await sendTelegramMessage(chatId, 'Неизвестная команда. Используйте /help.')
  }
}

function splitCommand(text: string) {
  const spaceIndex = text.indexOf(' ')
  if (spaceIndex === -1) {
    return { command: text, payload: '' }
  }
  return {
    command: text.slice(0, spaceIndex),
    payload: text.slice(spaceIndex + 1).trim(),
  }
}

async function handleLogin(message: TelegramMessage, payload: string) {
  const chatId = message.chat.id
  const userId = message.from?.id

  if (!userId) {
    await sendTelegramMessage(chatId, 'Не удалось определить пользователя.')
    return
  }

  if (!isSupabaseEnabled()) {
    await sendTelegramMessage(chatId, 'База данных недоступна. Используйте локальные файлы.')
    return
  }

  if (!payload) {
    await sendTelegramMessage(chatId, 'Укажите пароль: /login <пароль>')
    return
  }

  if (!TELEGRAM_ADMIN_PASSWORD) {
    await sendTelegramMessage(chatId, 'Пароль администратора не задан на сервере.')
    return
  }

  if (payload !== TELEGRAM_ADMIN_PASSWORD) {
    await sendTelegramMessage(chatId, 'Неверный пароль. Попробуйте снова.')
    return
  }

  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()

  try {
    await supabaseDelete('admin_sessions', {
      telegram_user_id: `eq.${userId}`,
    })
  } catch {
    // Игнорируем отсутствие записей
  }

  await supabaseRestRequest('admin_sessions', {
    method: 'POST',
    body: {
      telegram_user_id: userId,
      expires_at: expiresAt,
    },
  })

  await sendTelegramMessage(chatId, 'Успешный вход. Сессия активна 12 часов.')
}

async function handleLogout(message: TelegramMessage) {
  const chatId = message.chat.id
  const userId = message.from?.id

  if (!userId) {
    await sendTelegramMessage(chatId, 'Не удалось определить пользователя.')
    return
  }

  if (!isSupabaseEnabled()) {
    await sendTelegramMessage(chatId, 'База данных недоступна. Используйте локальные файлы.')
    return
  }

  await supabaseDelete('admin_sessions', {
    telegram_user_id: `eq.${userId}`,
  })

  await sendTelegramMessage(chatId, 'Вы вышли из панели администратора.')
}

async function ensureAuthorized(message: TelegramMessage) {
  const userId = message.from?.id
  const chatId = message.chat.id

  if (!userId) {
    await sendTelegramMessage(chatId, 'Не удалось определить пользователя.')
    return false
  }

  if (!isSupabaseEnabled()) {
    await sendTelegramMessage(chatId, 'База данных недоступна. Используйте локальные файлы.')
    return false
  }

  try {
    const sessions = await supabaseRestRequest<any[]>('admin_sessions', {
      searchParams: {
        select: 'expires_at',
        telegram_user_id: `eq.${userId}`,
        order: 'expires_at.desc',
        limit: '1',
      },
    })

    const session = sessions?.[0]
    if (!session || new Date(session.expires_at).getTime() < Date.now()) {
      await sendTelegramMessage(chatId, 'Авторизуйтесь командой /login <пароль>.')
      return false
    }
  } catch (error) {
    console.error('[Telegram] Проверка авторизации', error)
    await sendTelegramMessage(chatId, 'Не удалось проверить авторизацию. Попробуйте позже.')
    return false
  }

  return true
}

async function handleAddIcon(message: TelegramMessage, payload: string) {
  if (!(await ensureAuthorized(message))) return

  const chatId = message.chat.id
  const roundId = payload
  if (!roundId || !ROUND_ICON_IDS.includes(roundId)) {
    await sendTelegramMessage(
      chatId,
      'Укажите раунд: /add_icon guess-face|guess-melody|bible-quotes|guess-voice|calendar и прикрепите PNG.'
    )
    return
  }

  const fileId = extractImageFileId(message)
  if (!fileId) {
    await sendTelegramMessage(chatId, 'Прикрепите изображение (PNG/JPG) вместе с командой.')
    return
  }

  try {
    const file = await downloadTelegramFile(fileId)
    const extension = file.extension || 'png'
    const objectPath = `icons/${roundId}.${extension}`

    const publicUrl = await supabaseStorageUpload(objectPath, file.buffer, file.mimeType, {
      upsert: true,
    })

    await supabaseRestRequest('round_icons', {
      method: 'POST',
      searchParams: { on_conflict: 'round_id' },
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: {
        round_id: roundId,
        icon_url: publicUrl,
        updated_at: new Date().toISOString(),
      },
    })

    await sendTelegramMessage(chatId, `Иконка для ${roundId} обновлена.`)
  } catch (error) {
    console.error('[Telegram] Ошибка загрузки иконки', error)
    await sendTelegramMessage(chatId, 'Не удалось сохранить иконку. Попробуйте позже.')
  }
}

async function handleAddFace(message: TelegramMessage, payload: string) {
  if (!(await ensureAuthorized(message))) return

  const chatId = message.chat.id
  const fileId = extractImageFileId(message)
  if (!fileId) {
    await sendTelegramMessage(chatId, 'Прикрепите фотографию вместе с командой /add_face {json}.')
    return
  }

  const data = await parseJsonPayload(payload, chatId)
  if (!data) return

  if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
    await sendTelegramMessage(chatId, 'difficulty должен быть easy|medium|hard.')
    return
  }

  if (!Array.isArray(data.options) || data.options.length < 2) {
    await sendTelegramMessage(chatId, 'Укажите не менее двух вариантов в поле options.')
    return
  }

  if (!data.correctAnswer) {
    await sendTelegramMessage(chatId, 'Укажите correctAnswer.')
    return
  }

  try {
    const file = await downloadTelegramFile(fileId)
    const timestamp = Date.now()
    const extension = file.extension || 'jpg'
    const objectPath = `images/faces/${data.difficulty}/${timestamp}.${extension}`

    const publicUrl = await supabaseStorageUpload(objectPath, file.buffer, file.mimeType, {
      upsert: false,
    })

    await supabaseRestRequest('guess_face_questions', {
      method: 'POST',
      body: {
        difficulty: data.difficulty,
        image_url: publicUrl,
        parts: data.parts || ['nose', 'eyes', 'mouth', 'hands', 'full'],
        options: data.options,
        correct_answer: data.correctAnswer,
      },
    })

    await sendTelegramMessage(
      chatId,
      `Вопрос добавлен (${data.difficulty}). Файл сохранён: ${objectPath}`
    )
  } catch (error) {
    console.error('[Telegram] Ошибка добавления лица', error)
    await sendTelegramMessage(chatId, 'Не удалось добавить вопрос. Попробуйте позже.')
  }
}

async function handleAddAudio(
  message: TelegramMessage,
  payload: string,
  table: 'guess_melody_questions' | 'guess_voice_questions',
  folder: 'audio/melodies' | 'audio/voices'
) {
  if (!(await ensureAuthorized(message))) return

  const chatId = message.chat.id
  const fileInfo = extractAudioFile(message)

  if (!fileInfo) {
    await sendTelegramMessage(chatId, 'Прикрепите MP3 файл вместе с командой.')
    return
  }

  const data = await parseJsonPayload(payload, chatId)
  if (!data) return

  if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
    await sendTelegramMessage(chatId, 'difficulty должен быть easy|medium|hard.')
    return
  }

  if (!Array.isArray(data.options) || data.options.length < 2) {
    await sendTelegramMessage(chatId, 'Укажите массив options.')
    return
  }

  if (!data.correctAnswer) {
    await sendTelegramMessage(chatId, 'Укажите correctAnswer.')
    return
  }

  try {
    const file = await downloadTelegramFile(fileInfo.file_id)
    const timestamp = Date.now()
    const extension = file.extension || 'mp3'
    const objectPath = `${folder}/${data.difficulty}/${timestamp}.${extension}`

    const publicUrl = await supabaseStorageUpload(objectPath, file.buffer, file.mimeType, {
      upsert: false,
    })

    await supabaseRestRequest(table, {
      method: 'POST',
      body: {
        difficulty: data.difficulty,
        audio_url: publicUrl,
        options: data.options,
        correct_answer: data.correctAnswer,
      },
    })

    await sendTelegramMessage(chatId, `Аудиовопрос добавлен (${data.difficulty}).`)
  } catch (error) {
    console.error('[Telegram] Ошибка добавления аудио', error)
    await sendTelegramMessage(chatId, 'Не удалось добавить аудиовопрос. Попробуйте позже.')
  }
}

async function handleAddQuote(message: TelegramMessage, payload: string) {
  if (!(await ensureAuthorized(message))) return

  const chatId = message.chat.id
  const data = await parseJsonPayload(payload, chatId)
  if (!data) return

  if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
    await sendTelegramMessage(chatId, 'difficulty должен быть easy|medium|hard.')
    return
  }

  if (!data.quote || !data.questionType || !Array.isArray(data.options)) {
    await sendTelegramMessage(chatId, 'Укажите поля quote, questionType и options.')
    return
  }

  try {
    await supabaseRestRequest('bible_quote_questions', {
      method: 'POST',
      body: {
        difficulty: data.difficulty,
        quote: data.quote,
        question_type: data.questionType,
        options: data.options,
        correct_answer: data.correctAnswer,
        source: data.source,
      },
    })
    await sendTelegramMessage(chatId, `Цитата добавлена (${data.difficulty}).`)
  } catch (error) {
    console.error('[Telegram] Ошибка добавления цитаты', error)
    await sendTelegramMessage(chatId, 'Не удалось добавить цитату. Попробуйте позже.')
  }
}

async function parseJsonPayload(payload: string, chatId: number) {
  if (!payload) {
    await sendTelegramMessage(
      chatId,
      'Добавьте JSON после команды. Пример: /add_face {"difficulty":"easy",...}'
    )
    return null
  }

  try {
    return JSON.parse(payload)
  } catch (error) {
    await sendTelegramMessage(chatId, 'Неверный JSON. Проверьте синтаксис.')
    return null
  }
}

function extractImageFileId(message: TelegramMessage) {
  if (message.photo && message.photo.length > 0) {
    return message.photo[message.photo.length - 1].file_id
  }
  if (message.document && message.document.mime_type?.startsWith('image/')) {
    return message.document.file_id
  }
  return null
}

function extractAudioFile(message: TelegramMessage) {
  if (message.audio) {
    return message.audio
  }
  if (message.voice) {
    return message.voice
  }
  if (message.document && message.document.mime_type?.startsWith('audio/')) {
    return message.document
  }
  return null
}

async function downloadTelegramFile(fileId: string) {
  const fileResponse = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`
  )
  const fileResult = await fileResponse.json()
  if (!fileResult.ok) {
    throw new Error('Не удалось получить файл из Telegram')
  }

  const filePath = fileResult.result.file_path
  const downloadResponse = await fetch(
    `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`
  )
  if (!downloadResponse.ok) {
    throw new Error('Не удалось скачать файл из Telegram')
  }

  const arrayBuffer = await downloadResponse.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const extension = filePath.split('.').pop()
  const mimeType = downloadResponse.headers.get('content-type') || 'application/octet-stream'

  return { buffer, extension, mimeType }
}

async function sendTelegramMessage(chatId: number, text: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
    const result = await response.json()
    if (!result.ok) {
      console.error('[Telegram] Ошибка отправки сообщения:', result)
    } else {
      console.log('[Telegram] Сообщение отправлено в', chatId)
    }
  } catch (error) {
    console.error('[Telegram] Ошибка отправки сообщения', error)
    if (error instanceof Error) {
      console.error('[Telegram] Stack:', error.stack)
    }
  }
}

async function handleStatus(chatId: number) {
  const status = [
    '📊 Статус системы:',
    '',
    `✅ Telegram бот: ${TELEGRAM_BOT_TOKEN ? 'настроен' : 'не настроен'}`,
    `✅ Supabase: ${isSupabaseEnabled() ? 'настроен' : 'не настроен'}`,
    `✅ Vercel Blob: ${isVercelBlobEnabled() ? 'настроен' : 'не настроен'}`,
    `✅ Пароль админа: ${TELEGRAM_ADMIN_PASSWORD ? 'задан' : 'не задан'}`,
    '',
    isSupabaseEnabled() || isVercelBlobEnabled()
      ? '💾 Хранилище файлов доступно'
      : '⚠️ Хранилище не настроено, будут использоваться локальные файлы',
  ].join('\n')
  await sendTelegramMessage(chatId, status)
}

function getWelcomeText() {
  return [
    'Привет! Это админ-бот "Рождественские Тайны".',
    '1. Войдите: /login <пароль>',
    '2. Добавьте иконки, фото, аудио и цитаты прямо здесь.',
    '3. Используйте /help для подробных инструкций.',
    '4. Проверьте статус: /status',
  ].join('\n')
}

function getHelpText() {
  return [
    'Основные команды:',
    '/status — проверить статус системы',
    '/login <пароль> — вход в панель',
    '/logout — завершить сессию',
    '/add_icon <roundId> + изображение',
    '/add_face {"difficulty":"easy","options":[...],"correctAnswer":"..."} + фото',
    '/add_melody {"difficulty":"easy","options":[...],"correctAnswer":"..."} + mp3',
    '/add_voice {"difficulty":"easy","options":[...],"correctAnswer":"..."} + mp3',
    '/add_quote {"difficulty":"easy","quote":"...","questionType":"source","options":[...],"correctAnswer":"..."}',
    '',
    'Хранилище: Vercel Blob (если задан BLOB_READ_WRITE_TOKEN) или Supabase Storage.',
    'Если хранилище недоступно, игра использует локальные файлы из /public.',
  ].join('\n')
}

