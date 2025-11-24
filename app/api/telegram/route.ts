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

interface TelegramCallbackQuery {
  id: string
  from: TelegramUser
  message?: TelegramMessage
  data: string
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  edited_message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

// Состояния пользователей для пошагового сбора данных
interface UserState {
  type: 'add_face' | 'add_melody' | 'add_voice' | 'add_quote' | 'add_icon' | null
  step: string
  data: Record<string, any>
}

const userStates = new Map<number, UserState>()

export async function GET() {
  // GET endpoint для проверки статуса бота через браузер
  const supabaseUrl = process.env.SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
  
  return NextResponse.json({
    status: 'ok',
    bot_configured: Boolean(TELEGRAM_BOT_TOKEN),
    supabase_configured: isSupabaseEnabled(),
    vercel_blob_configured: isVercelBlobEnabled(),
    admin_password_set: Boolean(TELEGRAM_ADMIN_PASSWORD),
    secret_token_set: Boolean(TELEGRAM_SECRET_TOKEN),
    // Отладочная информация (без значений, только факт наличия)
    env_check: {
      has_supabase_url: Boolean(supabaseUrl),
      has_supabase_service_key: Boolean(supabaseServiceKey),
      has_supabase_anon_key: Boolean(supabaseAnonKey),
      supabase_url_length: supabaseUrl.length,
      active_key_length: (supabaseServiceKey || supabaseAnonKey).length,
    },
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
  // Обработка callback_query (нажатия на inline кнопки)
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query)
    return
  }

  const message = update.message || update.edited_message
  if (!message) {
    console.log('[Telegram] Нет message в update')
    return
  }

  const chatId = message.chat.id
  const userId = message.from?.id
  const text = (message.text || message.caption || '').trim()
  console.log('[Telegram] Сообщение от', chatId, 'текст:', text.substring(0, 100))

  // Проверяем, есть ли активное состояние для пользователя
  if (userId) {
    const state = userStates.get(userId)
    if (state && state.type) {
      // Продолжаем сбор данных
      await handleStateStep(message, state)
      return
    }
  }

  // Если нет активного состояния и текст не команда - показываем подсказку
  if (!text.startsWith('/') && !text.startsWith('menu_') && !text.startsWith('add_') && !text.startsWith('icon_')) {
    await sendTelegramMessage(chatId, 'Отправьте команду. Используйте /help для подсказки или /menu для меню.')
    return
  }

  const { command, payload } = splitCommand(text)
  console.log('[Telegram] Команда:', command, 'payload:', payload.substring(0, 50))

  switch (command) {
    case '/start':
      await sendTelegramMessage(chatId, getWelcomeText(), getMainMenuKeyboard())
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
    case '/menu':
      await showMainMenu(chatId)
      break
    case '/done':
      if (userId) {
        const state = userStates.get(userId)
        if (state && state.step === 'options' && state.data.options && state.data.options.length >= 2) {
          state.step = 'correctAnswer'
          await processStateStep(chatId, userId, state)
        } else {
          await sendTelegramMessage(chatId, '❌ Нужно минимум 2 варианта ответа.')
        }
      }
      break
    case '/add_icon':
      await startAddIcon(message)
      break
    case '/add_face':
      await startAddFace(message)
      break
    case '/add_melody':
      await startAddMelody(message)
      break
    case '/add_voice':
      await startAddVoice(message)
      break
    case '/add_quote':
      await startAddQuote(message)
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

// ========== Обработчики callback_query и состояний ==========

async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery) {
  const userId = callbackQuery.from.id
  const chatId = callbackQuery.message?.chat.id || callbackQuery.from.id
  const data = callbackQuery.data

  await answerCallbackQuery(callbackQuery.id)

  if (!(await ensureAuthorized({ from: callbackQuery.from, chat: { id: chatId } } as TelegramMessage))) {
    return
  }

  if (data === 'cancel') {
    userStates.delete(userId)
    await sendTelegramMessage(chatId, '❌ Отменено. Используйте /menu для главного меню.', getMainMenuKeyboard())
    return
  }

  if (data === 'menu_add') {
    await sendTelegramMessage(chatId, 'Выберите тип вопроса:', getAddQuestionTypeKeyboard())
    return
  }

  if (data === 'menu_icon') {
    await sendTelegramMessage(chatId, 'Выберите раунд для иконки:', getRoundIconKeyboard())
    return
  }

  if (data === 'menu_status') {
    await handleStatus(chatId)
    return
  }

  if (data.startsWith('icon_')) {
    const roundId = data.replace('icon_', '')
    userStates.set(userId, { type: 'add_icon', step: 'waiting_file', data: { roundId } })
    await sendTelegramMessage(chatId, `Отправьте PNG изображение для раунда "${roundId}"`)
    return
  }

  if (data.startsWith('add_')) {
    const type = data.replace('add_', '') as 'face' | 'melody' | 'voice' | 'quote'
    if (type === 'face') await startAddFace({ from: callbackQuery.from, chat: { id: chatId } } as TelegramMessage)
    else if (type === 'melody') await startAddMelody({ from: callbackQuery.from, chat: { id: chatId } } as TelegramMessage)
    else if (type === 'voice') await startAddVoice({ from: callbackQuery.from, chat: { id: chatId } } as TelegramMessage)
    else if (type === 'quote') await startAddQuote({ from: callbackQuery.from, chat: { id: chatId } } as TelegramMessage)
    return
  }

  // Убрана обработка выбора сложности - теперь всегда используется 'medium'

  // Обработка типа вопроса для цитат
  if (data.includes('_type_')) {
    const [prefix, questionType] = data.split('_type_')
    const state = userStates.get(userId)
    if (state && state.type === 'add_quote') {
      state.data.questionType = questionType
      state.step = 'quote'
      await sendTelegramMessage(chatId, '📝 Введите текст цитаты:')
    }
    return
  }
}

async function showMainMenu(chatId: number) {
  await sendTelegramMessage(chatId, '📋 Главное меню\n\nВыберите действие:', getMainMenuKeyboard())
}

async function startAddIcon(message: TelegramMessage) {
  if (!(await ensureAuthorized(message))) return
  const userId = message.from?.id
  const chatId = message.chat.id
  if (!userId) return

  await sendTelegramMessage(chatId, 'Выберите раунд для иконки:', getRoundIconKeyboard())
}

async function startAddFace(message: TelegramMessage) {
  if (!(await ensureAuthorized(message))) return
  const userId = message.from?.id
  const chatId = message.chat.id
  if (!userId) return

  userStates.set(userId, {
    type: 'add_face',
    step: 'options',
    data: { options: [], parts: ['nose', 'eyes', 'mouth', 'hands', 'full'], difficulty: 'medium' },
  })
  await sendTelegramMessage(chatId, '👤 Добавление вопроса "Угадай лицо"\n\nВведите первый вариант ответа:')
}

async function startAddMelody(message: TelegramMessage) {
  if (!(await ensureAuthorized(message))) return
  const userId = message.from?.id
  const chatId = message.chat.id
  if (!userId) return

  userStates.set(userId, { type: 'add_melody', step: 'options', data: { options: [], difficulty: 'medium' } })
  await sendTelegramMessage(chatId, '🎵 Добавление вопроса "Угадай мелодию"\n\nВведите первый вариант ответа:')
}

async function startAddVoice(message: TelegramMessage) {
  if (!(await ensureAuthorized(message))) return
  const userId = message.from?.id
  const chatId = message.chat.id
  if (!userId) return

  userStates.set(userId, { type: 'add_voice', step: 'options', data: { options: [], difficulty: 'medium' } })
  await sendTelegramMessage(chatId, '🎤 Добавление вопроса "Угадай голос"\n\nВведите первый вариант ответа:')
}

async function startAddQuote(message: TelegramMessage) {
  if (!(await ensureAuthorized(message))) return
  const userId = message.from?.id
  const chatId = message.chat.id
  if (!userId) return

  userStates.set(userId, { type: 'add_quote', step: 'questionType', data: { difficulty: 'medium' } })
  await sendTelegramMessage(chatId, '📖 Добавление библейской цитаты\n\nВыберите тип вопроса:', getQuestionTypeKeyboard('quote_type'))
}

function getNextStep(type: string, currentStep: string): string {
  const flows: Record<string, Record<string, string>> = {
    add_face: {
      options: 'correctAnswer',
      correctAnswer: 'photo',
    },
    add_melody: {
      options: 'audio',
    },
    add_voice: {
      options: 'audio',
    },
    add_quote: {
      questionType: 'quote',
      quote: 'options',
      options: 'correctAnswer',
      correctAnswer: 'source',
    },
  }
  return flows[type]?.[currentStep] || 'done'
}

async function handleStateStep(message: TelegramMessage, state: UserState) {
  const userId = message.from?.id
  const chatId = message.chat.id
  if (!userId) return

  if (state.step === 'options') {
    const text = (message.text || message.caption || '').trim()
    if (text) {
      if (!state.data.options) state.data.options = []
      state.data.options.push(text)
      const count = state.data.options.length
      await sendTelegramMessage(
        chatId,
        `✅ Вариант ${count} добавлен: "${text}"\n\nВведите следующий вариант ответа (минимум 2 варианта).\nИли отправьте /done для завершения.`
      )
    }
    return
  }

  if (state.step === 'correctAnswer') {
    const text = (message.text || message.caption || '').trim()
    if (text && state.type) {
      state.data.correctAnswer = text
      state.step = getNextStep(state.type, 'correctAnswer')
      await processStateStep(chatId, userId, state)
    }
    return
  }

  if (state.step === 'quote') {
    const text = (message.text || message.caption || '').trim()
    if (text) {
      state.data.quote = text
      state.step = 'options'
      await sendTelegramMessage(chatId, '📝 Цитата сохранена.\n\nВведите первый вариант ответа:')
    }
    return
  }

  if (state.step === 'source') {
    const text = (message.text || message.caption || '').trim()
    if (text) {
      state.data.source = text
      await finalizeQuestion(chatId, userId, state)
    }
    return
  }

  // Обработка файлов (проверяем после текстовых шагов)
  if (state.step === 'photo' && state.type === 'add_face') {
    const fileId = extractImageFileId(message)
    if (fileId) {
      state.data.fileId = fileId
      await finalizeQuestion(chatId, userId, state)
    } else {
      // Если файл не найден, но есть текст - это может быть ошибка
      const text = (message.text || message.caption || '').trim()
      if (text) {
        await sendTelegramMessage(chatId, '❌ На этом шаге нужна фотография, а не текст. Прикрепите фото.')
      } else {
        await sendTelegramMessage(chatId, '❌ Прикрепите фотографию.')
      }
    }
    return
  }

  if (state.step === 'audio' && (state.type === 'add_melody' || state.type === 'add_voice')) {
    const fileInfo = extractAudioFile(message)
    if (fileInfo) {
      state.data.fileId = fileInfo.file_id
      await finalizeQuestion(chatId, userId, state)
    } else {
      // Если файл не найден, но есть текст - это может быть ошибка
      const text = (message.text || message.caption || '').trim()
      if (text) {
        await sendTelegramMessage(chatId, '❌ На этом шаге нужен MP3 файл, а не текст. Прикрепите аудио.')
      } else {
        await sendTelegramMessage(chatId, '❌ Прикрепите MP3 файл.')
      }
    }
    return
  }

  if (state.step === 'waiting_file' && state.type === 'add_icon') {
    const fileId = extractImageFileId(message)
    if (fileId) {
      await finalizeIcon(chatId, userId, state, fileId)
    } else {
      // Если файл не найден, но есть текст - это может быть ошибка
      const text = (message.text || message.caption || '').trim()
      if (text) {
        await sendTelegramMessage(chatId, '❌ На этом шаге нужно изображение, а не текст. Прикрепите PNG.')
      } else {
        await sendTelegramMessage(chatId, '❌ Прикрепите PNG изображение.')
      }
    }
    return
  }
}

async function processStateStep(chatId: number, userId: number, state: UserState) {
  if (state.step === 'options') {
    await sendTelegramMessage(chatId, '📝 Введите первый вариант ответа:')
  } else if (state.step === 'correctAnswer') {
    const options = state.data.options || []
    const optionsText = options.map((o: string, i: number) => `${i + 1}. ${o}`).join('\n')
    await sendTelegramMessage(chatId, `Варианты ответов:\n${optionsText}\n\n✅ Введите правильный ответ:`)
  } else if (state.step === 'questionType' && state.type === 'add_quote') {
    await sendTelegramMessage(chatId, 'Выберите тип вопроса:', getQuestionTypeKeyboard('quote_type'))
  }
}

async function finalizeQuestion(chatId: number, userId: number, state: UserState) {
  if (!state.type) {
    await sendTelegramMessage(chatId, '❌ Ошибка: тип вопроса не определен.')
    return
  }

  try {
    if (state.type === 'add_face') {
      if (state.data.options.length < 2) {
        await sendTelegramMessage(chatId, '❌ Нужно минимум 2 варианта ответа. Введите еще варианты.')
        state.step = 'options'
        return
      }
      await saveFaceQuestion(chatId, state)
    } else if (state.type === 'add_melody') {
      if (state.data.options.length < 2) {
        await sendTelegramMessage(chatId, '❌ Нужно минимум 2 варианта ответа. Введите еще варианты.')
        state.step = 'options'
        return
      }
      await saveMelodyQuestion(chatId, state)
    } else if (state.type === 'add_voice') {
      if (state.data.options.length < 2) {
        await sendTelegramMessage(chatId, '❌ Нужно минимум 2 варианта ответа. Введите еще варианты.')
        state.step = 'options'
        return
      }
      await saveVoiceQuestion(chatId, state)
    } else if (state.type === 'add_quote') {
      if (!state.data.options || state.data.options.length < 2) {
        await sendTelegramMessage(chatId, '❌ Нужно минимум 2 варианта ответа. Введите еще варианты.')
        state.step = 'options'
        return
      }
      await saveQuoteQuestion(chatId, state)
    }
    userStates.delete(userId)
  } catch (error) {
    console.error('[Telegram] Ошибка сохранения вопроса', error)
    await sendTelegramMessage(chatId, '❌ Ошибка при сохранении. Попробуйте снова.')
  }
}

async function finalizeIcon(chatId: number, userId: number, state: UserState, fileId: string) {
  try {
    const file = await downloadTelegramFile(fileId)
    const extension = file.extension || 'png'
    const objectPath = `icons/${state.data.roundId}.${extension}`

    const publicUrl = await supabaseStorageUpload(objectPath, file.buffer, file.mimeType, {
      upsert: true,
    })

    await supabaseRestRequest('round_icons', {
      method: 'POST',
      searchParams: { on_conflict: 'round_id' },
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: {
        round_id: state.data.roundId,
        icon_url: publicUrl,
        updated_at: new Date().toISOString(),
      },
    })

    userStates.delete(userId)
    await sendTelegramMessage(chatId, `✅ Иконка для "${state.data.roundId}" успешно обновлена!`, getMainMenuKeyboard())
  } catch (error) {
    console.error('[Telegram] Ошибка сохранения иконки', error)
    await sendTelegramMessage(chatId, '❌ Ошибка при сохранении иконки. Попробуйте снова.')
  }
}

async function saveFaceQuestion(chatId: number, state: UserState) {
  const file = await downloadTelegramFile(state.data.fileId)
  const timestamp = Date.now()
  const extension = file.extension || 'jpg'
  const objectPath = `images/faces/${state.data.difficulty}/${timestamp}.${extension}`

  const publicUrl = await supabaseStorageUpload(objectPath, file.buffer, file.mimeType, {
    upsert: false,
  })

  await supabaseRestRequest('guess_face_questions', {
    method: 'POST',
    body: {
      difficulty: state.data.difficulty,
      image_url: publicUrl,
      parts: state.data.parts || ['nose', 'eyes', 'mouth', 'hands', 'full'],
      options: state.data.options,
      correct_answer: state.data.correctAnswer,
    },
  })

  await sendTelegramMessage(chatId, `✅ Вопрос "Угадай лицо" успешно добавлен!`, getMainMenuKeyboard())
}

async function saveMelodyQuestion(chatId: number, state: UserState) {
  const file = await downloadTelegramFile(state.data.fileId)
  const timestamp = Date.now()
  const extension = file.extension || 'mp3'
  const objectPath = `audio/melodies/${state.data.difficulty}/${timestamp}.${extension}`

  const publicUrl = await supabaseStorageUpload(objectPath, file.buffer, file.mimeType, {
    upsert: false,
  })

  await supabaseRestRequest('guess_melody_questions', {
    method: 'POST',
    body: {
      difficulty: state.data.difficulty,
      audio_url: publicUrl,
      options: state.data.options,
      correct_answer: state.data.correctAnswer,
    },
  })

  await sendTelegramMessage(chatId, `✅ Вопрос "Угадай мелодию" успешно добавлен!`, getMainMenuKeyboard())
}

async function saveVoiceQuestion(chatId: number, state: UserState) {
  const file = await downloadTelegramFile(state.data.fileId)
  const timestamp = Date.now()
  const extension = file.extension || 'mp3'
  const objectPath = `audio/voices/${state.data.difficulty}/${timestamp}.${extension}`

  const publicUrl = await supabaseStorageUpload(objectPath, file.buffer, file.mimeType, {
    upsert: false,
  })

  await supabaseRestRequest('guess_voice_questions', {
    method: 'POST',
    body: {
      difficulty: state.data.difficulty,
      audio_url: publicUrl,
      options: state.data.options,
      correct_answer: state.data.correctAnswer,
    },
  })

  await sendTelegramMessage(chatId, `✅ Вопрос "Угадай голос" успешно добавлен!`, getMainMenuKeyboard())
}

async function saveQuoteQuestion(chatId: number, state: UserState) {
  await supabaseRestRequest('bible_quote_questions', {
    method: 'POST',
    body: {
      difficulty: state.data.difficulty,
      quote: state.data.quote,
      question_type: state.data.questionType,
      options: state.data.options,
      correct_answer: state.data.correctAnswer,
      source: state.data.source || '',
    },
  })

  await sendTelegramMessage(chatId, `✅ Библейская цитата успешно добавлена!`, getMainMenuKeyboard())
}

async function handleLogin(message: TelegramMessage, payload: string) {
  const chatId = message.chat.id
  const userId = message.from?.id

  if (!userId) {
    await sendTelegramMessage(chatId, 'Не удалось определить пользователя.')
    return
  }

  if (!isSupabaseEnabled()) {
    const supabaseUrl = process.env.SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
    
    const missing = []
    if (!supabaseUrl) missing.push('SUPABASE_URL')
    if (!supabaseServiceKey && !supabaseAnonKey) {
      missing.push('SUPABASE_SERVICE_ROLE_KEY или SUPABASE_ANON_KEY')
    }
    
    await sendTelegramMessage(
      chatId,
      '❌ База данных Supabase не настроена.\n\n' +
        `Отсутствуют: ${missing.join(', ')}\n\n` +
        'Для работы бота нужна база данных Supabase (для хранения сессий и вопросов).\n' +
        'Vercel Blob Storage используется только для файлов (иконки, фото, аудио).\n\n' +
        '⚠️ Если проект на Vercel, задайте переменные в:\n' +
        'Vercel Dashboard → Settings → Environment Variables\n\n' +
        'Проверьте детальный статус: /status'
    )
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

  await sendTelegramMessage(chatId, '✅ Успешный вход! Сессия активна 12 часов.', getMainMenuKeyboard())
}

async function handleLogout(message: TelegramMessage) {
  const chatId = message.chat.id
  const userId = message.from?.id

  if (!userId) {
    await sendTelegramMessage(chatId, 'Не удалось определить пользователя.')
    return
  }

  if (!isSupabaseEnabled()) {
    await sendTelegramMessage(
      chatId,
      '❌ База данных Supabase не настроена. Настройте SUPABASE_URL и ключи.'
    )
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
    await sendTelegramMessage(
      chatId,
      '❌ База данных Supabase не настроена. Настройте SUPABASE_URL и ключи для работы бота.'
    )
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

  // Используем 'medium' по умолчанию, если difficulty не указан
  if (!data.difficulty) {
    data.difficulty = 'medium'
  }
  
  if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
    await sendTelegramMessage(chatId, 'difficulty должен быть easy|medium|hard. Используется medium по умолчанию.')
    data.difficulty = 'medium'
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

  // Используем 'medium' по умолчанию, если difficulty не указан
  if (!data.difficulty) {
    data.difficulty = 'medium'
  }
  
  if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
    await sendTelegramMessage(chatId, 'difficulty должен быть easy|medium|hard. Используется medium по умолчанию.')
    data.difficulty = 'medium'
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

  // Используем 'medium' по умолчанию, если difficulty не указан
  if (!data.difficulty) {
    data.difficulty = 'medium'
  }
  
  if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
    await sendTelegramMessage(chatId, 'difficulty должен быть easy|medium|hard. Используется medium по умолчанию.')
    data.difficulty = 'medium'
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

async function sendTelegramMessage(
  chatId: number,
  text: string,
  keyboard?: any,
  replyToMessageId?: number
) {
  try {
    const payload: any = {
      chat_id: chatId,
      text,
      // Убираем parse_mode, чтобы избежать ошибок парсинга HTML
      // parse_mode: 'HTML',
    }

    if (keyboard) {
      payload.reply_markup = keyboard
    }

    if (replyToMessageId) {
      payload.reply_to_message_id = replyToMessageId
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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

async function answerCallbackQuery(callbackQueryId: string, text?: string, showAlert = false) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    })
  } catch (error) {
    console.error('[Telegram] Ошибка ответа на callback', error)
  }
}

function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '➕ Добавить вопрос', callback_data: 'menu_add' },
        { text: '🖼️ Добавить иконку', callback_data: 'menu_icon' },
      ],
      [{ text: '📊 Статус', callback_data: 'menu_status' }],
    ],
  }
}

// Функция getDifficultyKeyboard удалена - сложность больше не выбирается

function getQuestionTypeKeyboard(callbackPrefix: string) {
  return {
    inline_keyboard: [
      [
        { text: '📖 Источник', callback_data: `${callbackPrefix}_source` },
        { text: '➡️ Продолжить', callback_data: `${callbackPrefix}_continue` },
      ],
      [{ text: '❌ Отмена', callback_data: 'cancel' }],
    ],
  }
}

function getRoundIconKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '👤 Угадай лицо', callback_data: 'icon_guess-face' },
        { text: '🎵 Угадай мелодию', callback_data: 'icon_guess-melody' },
      ],
      [
        { text: '📖 Библейские цитаты', callback_data: 'icon_bible-quotes' },
        { text: '🎤 Угадай голос', callback_data: 'icon_guess-voice' },
      ],
      [{ text: '📅 Календарь', callback_data: 'icon_calendar' }, { text: '❌ Отмена', callback_data: 'cancel' }],
    ],
  }
}

function getAddQuestionTypeKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '👤 Угадай лицо', callback_data: 'add_face' },
        { text: '🎵 Угадай мелодию', callback_data: 'add_melody' },
      ],
      [
        { text: '🎤 Угадай голос', callback_data: 'add_voice' },
        { text: '📖 Библейская цитата', callback_data: 'add_quote' },
      ],
      [{ text: '❌ Отмена', callback_data: 'cancel' }],
    ],
  }
}

async function handleStatus(chatId: number) {
  const supabaseUrl = process.env.SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
  const supabaseOk = isSupabaseEnabled()
  const blobOk = isVercelBlobEnabled()
  
  const missingSupabase = []
  if (!supabaseUrl) missingSupabase.push('SUPABASE_URL')
  if (!supabaseServiceKey && !supabaseAnonKey) {
    missingSupabase.push('SUPABASE_SERVICE_ROLE_KEY или SUPABASE_ANON_KEY')
  }
  
  const status = [
    '📊 Статус системы:',
    '',
    `✅ Telegram бот: ${TELEGRAM_BOT_TOKEN ? 'настроен' : '❌ не настроен'}`,
    '',
    `✅ Supabase (БД): ${supabaseOk ? 'настроен ✅' : '❌ не настроен'}`,
    ...(supabaseOk
      ? []
      : [
          `   Отсутствуют: ${missingSupabase.join(', ')}`,
          `   SUPABASE_URL: ${supabaseUrl ? '✅ есть' : '❌ нет'} (длина: ${supabaseUrl.length})`,
          `   Ключи: ${supabaseServiceKey || supabaseAnonKey ? '✅ есть' : '❌ нет'}`,
        ]),
    '',
    `✅ Vercel Blob (файлы): ${blobOk ? 'настроен ✅' : '❌ не настроен'}`,
    `   ${blobOk ? '' : '   Нужен: BLOB_READ_WRITE_TOKEN'}`,
    '',
    `✅ Пароль админа: ${TELEGRAM_ADMIN_PASSWORD ? 'задан ✅' : '❌ не задан'}`,
    '',
    supabaseOk
      ? '✅ Бот готов к работе'
      : '❌ Для работы бота нужна база данных Supabase',
    '',
    blobOk
      ? '💾 Файлы будут сохраняться в Vercel Blob'
      : supabaseOk
      ? '💾 Файлы будут сохраняться в Supabase Storage'
      : '⚠️ Хранилище не настроено',
  ].join('\n')
  await sendTelegramMessage(chatId, status)
}

function getWelcomeText() {
  return '👋 Привет! Это админ-бот "Рождественские Тайны"\n\n' +
    'Используйте кнопки ниже для навигации.\n' +
    'Для входа отправьте: /login пароль'
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

