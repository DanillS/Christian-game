import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import {
  isSupabaseEnabled,
  isVercelBlobEnabled,
  supabaseDelete,
  supabaseRestRequest,
  supabaseStorageUpload,
  updateAdminSession,
} from "@/lib/server/supabaseClient";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_ADMIN_PASSWORD = process.env.TELEGRAM_ADMIN_PASSWORD || "";
const TELEGRAM_SECRET_TOKEN = process.env.TELEGRAM_SECRET_TOKEN || "";

const ROUND_ICON_IDS = [
  "guess-face",
  "guess-melody",
  "bible-quotes",
  "guess-voice",
  "calendar",
];

interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface TelegramChat {
  id: number;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  text?: string;
  caption?: string;
  photo?: { file_id: string }[];
  document?: { file_id: string; mime_type?: string; file_name?: string } | null;
  audio?: { file_id: string; mime_type?: string; file_name?: string } | null;
  voice?: { file_id: string; mime_type?: string } | null;
  video?: { file_id: string; mime_type?: string; file_name?: string } | null;
  video_note?: { file_id: string } | null;
}

interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

// Состояния пользователей для пошагового сбора данных
interface UserState {
  type:
    | "add_face"
    | "add_melody"
    | "add_voice"
    | "add_quote"
    | "add_calendar"
    | "add_icon"
    | "login"
    | null;
  step: string;
  data: Record<string, any>;
}

const userStates = new Map<number, UserState>();

export async function GET() {
  // GET endpoint для проверки статуса бота через браузер
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

  return NextResponse.json({
    status: "ok",
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
  });
}

export async function POST(request: Request) {
  console.log("[Telegram] Получен запрос");

  if (!TELEGRAM_BOT_TOKEN) {
    console.error("[Telegram] Не задан TELEGRAM_BOT_TOKEN, бот недоступен");
    return NextResponse.json({ ok: true, error: "TELEGRAM_BOT_TOKEN not set" });
  }

  if (TELEGRAM_SECRET_TOKEN) {
    const secret = request.headers.get("x-telegram-bot-api-secret-token");
    if (secret !== TELEGRAM_SECRET_TOKEN) {
      console.error("[Telegram] Неверный secret token");
      return new Response("Unauthorized", { status: 401 });
    }
  }

  try {
    const update: TelegramUpdate = await request.json();
    console.log("[Telegram] Обработка update:", update.update_id);
    await processUpdate(update);
  } catch (error) {
    console.error("[Telegram] Ошибка обработки вебхука", error);
    if (error instanceof Error) {
      console.error("[Telegram] Stack:", error.stack);
    }
  }

  return NextResponse.json({ ok: true });
}

async function processUpdate(update: TelegramUpdate) {
  // Обработка callback_query (нажатия на inline кнопки) - оставляем для обратной совместимости
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
    return;
  }

  const message = update.message || update.edited_message;
  if (!message) {
    console.log("[Telegram] Нет message в update");
    return;
  }

  const chatId = message.chat.id;
  const userId = message.from?.id;
  const text = (message.text || message.caption || "").trim();
  console.log(
    "[Telegram] Сообщение от",
    chatId,
    "текст:",
    text.substring(0, 100)
  );

  // Обработка текстовых команд и reply кнопок
  if (text) {
    // Обработка команды /start - сбрасывает состояние и показывает главное меню
    if (text === "/start") {
      if (userId) {
        userStates.delete(userId); // Сбрасываем любое активное состояние
      }
      await sendTelegramMessage(
        chatId,
        getWelcomeText(),
        getMainMenuKeyboard()
      );
      return;
    }

    // Обработка команды /login <пароль>
    if (text.startsWith("/login ")) {
      const password = text.replace("/login ", "").trim();
      if (userId) {
        userStates.set(userId, { type: "login", step: "password", data: {} });
        await handleLoginStep(
          { ...message, text: password } as TelegramMessage,
          { type: "login", step: "password", data: {} }
        );
      }
      return;
    }

    // Обработка reply кнопок главного меню
    if (text === "👤 Угадай лицо") {
      if (userId) {
        const mockMessage = {
          from: message.from,
          chat: message.chat,
        } as TelegramMessage;
        await startAddFace(mockMessage);
      }
      return;
    }

    if (text === "🎵 Угадай мелодию") {
      if (userId) {
        const mockMessage = {
          from: message.from,
          chat: message.chat,
        } as TelegramMessage;
        await startAddMelody(mockMessage);
      }
      return;
    }

    if (text === "🎤 Угадай голос") {
      if (userId) {
        const mockMessage = {
          from: message.from,
          chat: message.chat,
        } as TelegramMessage;
        await startAddVoice(mockMessage);
      }
      return;
    }

    if (text === "📖 Библейская цитата") {
      if (userId) {
        const mockMessage = {
          from: message.from,
          chat: message.chat,
        } as TelegramMessage;
        await startAddQuote(mockMessage);
      }
      return;
    }

    if (text === "📅 Календарь") {
      if (userId) {
        const mockMessage = {
          from: message.from,
          chat: message.chat,
        } as TelegramMessage;
        await startAddCalendar(mockMessage);
      }
      return;
    }

    if (text === "🖼️ Добавить иконку") {
      if (userId) {
        userStates.set(userId, {
          type: "add_icon",
          step: "waiting_round",
          data: {},
        });
        await sendTelegramMessage(
          chatId,
          "Выберите раунд для иконки:",
          getRoundIconKeyboard()
        );
      }
      return;
    }

    if (text === "📊 Статус") {
      await handleStatus(chatId);
      return;
    }

    if (text === "🔐 Войти") {
      if (userId) {
        userStates.set(userId, { type: "login", step: "password", data: {} });
        await sendTelegramMessage(
          chatId,
          "🔐 Введите пароль администратора:",
          getCancelKeyboard()
        );
      }
      return;
    }

    if (text === "🚪 Выйти") {
      await handleLogout(message);
      return;
    }

    // Обработка кнопок выбора раунда для иконки (проверяем состояние текущего пользователя)
    if (userId) {
      const state = userStates.get(userId);
      if (state?.type === "add_icon" && state.step === "waiting_round") {
        if (text === "👤 Угадай лицо") {
          state.step = "waiting_file";
          state.data.roundId = "guess-face";
          await sendTelegramMessage(
            chatId,
            '🖼️ Добавление иконки для раунда "guess-face"\n\n📸 Прикрепите изображение (PNG, JPG, JPEG):',
            getCancelKeyboard()
          );
          return;
        }
        if (text === "🎵 Угадай мелодию") {
          state.step = "waiting_file";
          state.data.roundId = "guess-melody";
          await sendTelegramMessage(
            chatId,
            '🖼️ Добавление иконки для раунда "guess-melody"\n\n📸 Прикрепите изображение (PNG, JPG, JPEG):',
            getCancelKeyboard()
          );
          return;
        }
        if (text === "📖 Библейские цитаты") {
          state.step = "waiting_file";
          state.data.roundId = "bible-quotes";
          await sendTelegramMessage(
            chatId,
            '🖼️ Добавление иконки для раунда "bible-quotes"\n\n📸 Прикрепите изображение (PNG, JPG, JPEG):',
            getCancelKeyboard()
          );
          return;
        }
        if (text === "🎤 Угадай голос") {
          state.step = "waiting_file";
          state.data.roundId = "guess-voice";
          await sendTelegramMessage(
            chatId,
            '🖼️ Добавление иконки для раунда "guess-voice"\n\n📸 Прикрепите изображение (PNG, JPG, JPEG):',
            getCancelKeyboard()
          );
          return;
        }
        if (text === "📅 Календарь") {
          state.step = "waiting_file";
          state.data.roundId = "calendar";
          await sendTelegramMessage(
            chatId,
            '🖼️ Добавление иконки для раунда "calendar"\n\n📸 Прикрепите изображение (PNG, JPG, JPEG):',
            getCancelKeyboard()
          );
          return;
        }
      }
    }

    // Обработка кнопки "Готово" для вариантов ответов
    if (text === "✅ Готово (минимум 2 варианта)") {
      if (userId) {
        const state = userStates.get(userId);
        if (state && state.step === "options") {
          if (!state.data.options || state.data.options.length < 2) {
            await sendTelegramMessage(
              chatId,
              "❌ Нужно минимум 2 варианта ответа. Введите еще варианты.",
              getCancelKeyboard()
            );
            return;
          }
          state.step = "correctAnswer";
          await processStateStep(chatId, userId, state);
        }
      }
      return;
    }

    // Обработка кнопки отмены
    if (text === "❌ Отмена") {
      if (userId) {
        userStates.delete(userId);
        await sendTelegramMessage(
          chatId,
          "❌ Отменено.",
          getMainMenuKeyboard()
        );
      }
      return;
    }

    // Обработка кнопок для типов вопросов (только на нужных шагах)
    if (text === "📖 Источник") {
      if (userId) {
        const state = userStates.get(userId);
        // Кнопка "📖 Источник" работает только после ввода цитаты и вариантов
        if (
          state &&
          state.type === "add_quote" &&
          state.step === "correctAnswer"
        ) {
          state.step = "source";
          await sendTelegramMessage(
            chatId,
            "📝 Шаг 4/5: Введите источник цитаты:",
            getCancelKeyboard()
          );
        }
      }
      return;
    }

    if (text === "➡️ Продолжить") {
      if (userId) {
        const state = userStates.get(userId);
        // Кнопка "➡️ Продолжить" работает на шаге questionType (пропустить источник) или после correctAnswer
        if (state && state.type === "add_quote") {
          if (state.step === "questionType") {
            // Если еще не выбран тип вопроса, устанавливаем по умолчанию
            if (!state.data.questionType) {
              state.data.questionType = "quote";
            }
            state.step = "quote";
            await sendTelegramMessage(
              chatId,
              "📝 Шаг 2/5: Введите текст цитаты:",
              getCancelKeyboard()
            );
          } else if (state.step === "correctAnswer") {
            // Пропустить источник и перейти к финализации
            state.step = "finalize";
            await processStateStep(chatId, userId, state);
          }
        }
      }
      return;
    }

    // Обработка команды /status
    if (text === "/status") {
      await handleStatus(chatId);
      return;
    }

    // Обработка команды /add_face и других команд добавления
    if (text.startsWith("/add_")) {
      const type = text.replace("/add_", "").trim();
      if (userId) {
        const mockMessage = {
          from: message.from,
          chat: message.chat,
        } as TelegramMessage;
        if (type === "face") {
          await startAddFace(mockMessage);
        } else if (type === "melody") {
          await startAddMelody(mockMessage);
        } else if (type === "voice") {
          await startAddVoice(mockMessage);
        } else if (type === "quote") {
          await startAddQuote(mockMessage);
        }
      }
      return;
    }
  }

  // Проверяем состояние пользователя ПОСЛЕ обработки команд
  if (userId) {
    const state = userStates.get(userId);

    // Если есть активное состояние логина - обрабатываем пароль
    if (state && state.type === "login") {
      await handleLoginStep(message, state);
      return;
    }

    // Если есть другое активное состояние - обрабатываем его
    if (state && state.type) {
      await handleStateStep(message, state);
      return;
    }
  }

  // Если нет активного состояния и это текстовое сообщение - игнорируем
  // Главное меню показывается только через кнопки
  if (text) {
    // Игнорируем текстовые сообщения без активного состояния
    return;
  }

  // Если нет активного состояния - показываем главное меню
  await sendTelegramMessage(chatId, getWelcomeText(), getMainMenuKeyboard());
}

// ========== Обработчики callback_query и состояний ==========

async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message?.chat.id || callbackQuery.from.id;
  const data = callbackQuery.data;

  await answerCallbackQuery(callbackQuery.id);

  if (
    !(await ensureAuthorized({
      from: callbackQuery.from,
      chat: { id: chatId },
    } as TelegramMessage))
  ) {
    return;
  }

  if (data === "cancel") {
    userStates.delete(userId);
    await sendTelegramMessage(chatId, "❌ Отменено.", getMainMenuKeyboard());
    return;
  }

  if (data === "menu_main") {
    await showMainMenu(chatId);
    return;
  }

  if (data === "menu_login") {
    userStates.set(userId, { type: "login", step: "password", data: {} });
    await sendTelegramMessage(
      chatId,
      "🔐 Введите пароль администратора:",
      getCancelKeyboard()
    );
    return;
  }

  if (data === "menu_logout") {
    await handleLogout({
      from: callbackQuery.from,
      chat: { id: chatId },
    } as TelegramMessage);
    return;
  }

  if (data === "menu_add") {
    await sendTelegramMessage(
      chatId,
      "Выберите тип вопроса:",
      getAddQuestionTypeKeyboard()
    );
    return;
  }

  if (data === "menu_icon") {
    userStates.set(userId, {
      type: "add_icon",
      step: "waiting_round",
      data: {},
    });
    await sendTelegramMessage(
      chatId,
      "Выберите раунд для иконки:",
      getRoundIconKeyboard()
    );
    return;
  }

  if (data === "menu_status") {
    await handleStatus(chatId);
    return;
  }

  if (data.startsWith("icon_")) {
    const roundId = data.replace("icon_", "");
    userStates.set(userId, {
      type: "add_icon",
      step: "waiting_file",
      data: { roundId },
    });
    await sendTelegramMessage(
      chatId,
      `🖼️ Добавление иконки для раунда "${roundId}"\n\n📸 Прикрепите изображение (PNG, JPG, JPEG):`,
      getCancelKeyboard()
    );
    return;
  }

  if (data.startsWith("add_")) {
    const type = data.replace("add_", "") as
      | "face"
      | "melody"
      | "voice"
      | "quote";
    if (type === "face")
      await startAddFace({
        from: callbackQuery.from,
        chat: { id: chatId },
      } as TelegramMessage);
    else if (type === "melody")
      await startAddMelody({
        from: callbackQuery.from,
        chat: { id: chatId },
      } as TelegramMessage);
    else if (type === "voice")
      await startAddVoice({
        from: callbackQuery.from,
        chat: { id: chatId },
      } as TelegramMessage);
    else if (type === "quote")
      await startAddQuote({
        from: callbackQuery.from,
        chat: { id: chatId },
      } as TelegramMessage);
    return;
  }

  if (data === "done_options") {
    const state = userStates.get(userId);
    if (state && state.step === "options") {
      if (!state.data.options || state.data.options.length < 2) {
        await sendTelegramMessage(
          chatId,
          "❌ Нужно минимум 2 варианта ответа. Введите еще варианты.",
          getCancelKeyboard()
        );
        return;
      }
      state.step = "correctAnswer";
      await processStateStep(chatId, userId, state);
    }
    return;
  }

  // Убрана обработка выбора сложности - теперь всегда используется 'medium'

  // Обработка типа вопроса для цитат
  if (data.includes("_type_")) {
    const [prefix, questionType] = data.split("_type_");
    const state = userStates.get(userId);
    if (state && state.type === "add_quote") {
      state.data.questionType = questionType;
      state.step = "quote";
      await sendTelegramMessage(
        chatId,
        "📝 Шаг 2/5: Введите текст цитаты:",
        getCancelKeyboard()
      );
    }
    return;
  }
}

async function showMainMenu(chatId: number) {
  await sendTelegramMessage(
    chatId,
    "📋 Главное меню\n\nВыберите действие:",
    getMainMenuKeyboard()
  );
}

async function startAddIcon(message: TelegramMessage) {
  if (!(await ensureAuthorized(message))) return;
  const userId = message.from?.id;
  const chatId = message.chat.id;
  if (!userId) return;

  await sendTelegramMessage(
    chatId,
    "Выберите раунд для иконки:",
    getRoundIconKeyboard()
  );
}

async function startAddFace(message: TelegramMessage) {
  if (!(await ensureAuthorized(message))) return;
  const userId = message.from?.id;
  const chatId = message.chat.id;
  if (!userId) return;

  userStates.set(userId, {
    type: "add_face",
    step: "options",
    data: {
      options: [],
      parts: ["nose", "eyes", "mouth", "hands", "full"],
      difficulty: "medium",
    },
  });
  await sendTelegramMessage(
    chatId,
    '👤 Добавление вопроса "Угадай лицо"\n\n📝 Шаг 1/4: Введите варианты ответов\n\nВведите первый вариант ответа (минимум 2 варианта):',
    getCancelKeyboard()
  );
}

async function startAddMelody(message: TelegramMessage) {
  if (!(await ensureAuthorized(message))) return;
  const userId = message.from?.id;
  const chatId = message.chat.id;
  if (!userId) return;

  userStates.set(userId, {
    type: "add_melody",
    step: "options",
    data: { options: [], difficulty: "medium" },
  });
  await sendTelegramMessage(
    chatId,
    '🎵 Добавление вопроса "Угадай мелодию"\n\n📝 Шаг 1/3: Введите варианты ответов\n\nВведите первый вариант ответа (минимум 2 варианта):',
    getCancelKeyboard()
  );
}

async function startAddVoice(message: TelegramMessage) {
  if (!(await ensureAuthorized(message))) return;
  const userId = message.from?.id;
  const chatId = message.chat.id;
  if (!userId) return;

  userStates.set(userId, {
    type: "add_voice",
    step: "options",
    data: { options: [], difficulty: "medium" },
  });
  await sendTelegramMessage(
    chatId,
    '🎤 Добавление вопроса "Угадай голос"\n\n📝 Шаг 1/4: Введите варианты ответов\n\nВведите первый вариант ответа (минимум 2 варианта):',
    getCancelKeyboard()
  );
}

async function startAddQuote(message: TelegramMessage) {
  if (!(await ensureAuthorized(message))) return;
  const userId = message.from?.id;
  const chatId = message.chat.id;
  if (!userId) return;

  userStates.set(userId, {
    type: "add_quote",
    step: "question",
    data: { difficulty: "medium", correctAnswers: [] },
  });
  await sendTelegramMessage(
    chatId,
    "📖 Добавление библейской цитаты\n\n📝 Шаг 1/3: Введите текст вопроса:",
    getCancelKeyboard()
  );
}

async function startAddCalendar(message: TelegramMessage) {
  if (!(await ensureAuthorized(message))) return;
  const userId = message.from?.id;
  const chatId = message.chat.id;
  if (!userId) return;

  userStates.set(userId, {
    type: "add_calendar",
    step: "question",
    data: { difficulty: "medium", options: [] },
  });
  await sendTelegramMessage(
    chatId,
    "📅 Добавление вопроса в Календарь\n\n📝 Шаг 1/4: Введите текст вопроса:",
    getCancelKeyboard()
  );
}

function getNextStep(type: string, currentStep: string): string {
  const flows: Record<string, Record<string, string>> = {
    add_face: {
      options: "correctAnswer",
      correctAnswer: "photo",
      photo: "fullPhoto",
    },
    add_melody: {
      options: "correctAnswer",
      correctAnswer: "audio",
    },
    add_voice: {
      options: "correctAnswer",
      correctAnswer: "audio",
      audio: "originalAudio",
    },
    add_quote: {
      questionType: "quote",
      quote: "options",
      options: "correctAnswer",
      correctAnswer: "source",
    },
  };
  return flows[type]?.[currentStep] || "done";
}

async function handleStateStep(message: TelegramMessage, state: UserState) {
  const userId = message.from?.id;
  const chatId = message.chat.id;
  if (!userId) return;

  if (state.step === "options") {
    const text = (message.text || message.caption || "").trim();
    if (text) {
      if (!state.data.options) state.data.options = [];
      state.data.options.push(text);
      const count = state.data.options.length;
      const keyboard = {
        keyboard: [
          [
            {
              text: "✅ Готово (минимум 2 варианта)",
            },
          ],
          [{ text: "❌ Отмена" }],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      };
      await sendTelegramMessage(
        chatId,
        `✅ Вариант ${count} добавлен: "${text}"\n\nВведите следующий вариант ответа или нажмите "Готово" (минимум 2 варианта):`,
        keyboard
      );
    }
    return;
  }

  if (state.step === "correctAnswer") {
    const text = (message.text || message.caption || "").trim();
    if (text && state.type) {
      // Проверяем, что правильный ответ есть в списке вариантов
      const options = state.data.options || [];
      if (!options.includes(text)) {
        await sendTelegramMessage(
          chatId,
          `❌ Ошибка: "${text}" не найден в списке вариантов.\n\nВарианты:\n${options
            .map((o: string, i: number) => `${i + 1}. ${o}`)
            .join("\n")}\n\nВведите правильный ответ точно как в списке:`,
          getCancelKeyboard()
        );
        return;
      }
      state.data.correctAnswer = text;
      state.step = getNextStep(state.type, "correctAnswer");
      await processStateStep(chatId, userId, state);
    }
    return;
  }

  // Обработка шагов для библейских цитат (новая логика)
  if (state.step === "question" && state.type === "add_quote") {
    const text = (message.text || message.caption || "").trim();
    if (text) {
      state.data.question = text;
      state.step = "correctAnswers";
      const keyboard = {
        keyboard: [
          [{ text: "✅ Готово (минимум 1 ответ)" }],
          [{ text: "❌ Отмена" }],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      };
      await sendTelegramMessage(
        chatId,
        "📝 Шаг 2/3: Вопрос сохранен.\n\nВведите правильный ответ (можно несколько вариантов):",
        keyboard
      );
    }
    return;
  }

  if (state.step === "correctAnswers" && state.type === "add_quote") {
    const text = (message.text || message.caption || "").trim();
    if (text === "✅ Готово (минимум 1 ответ)") {
      if (!state.data.correctAnswers || state.data.correctAnswers.length < 1) {
        await sendTelegramMessage(
          chatId,
          "❌ Нужен минимум 1 правильный ответ. Введите ответ.",
          getCancelKeyboard()
        );
        return;
      }
      await finalizeQuestion(chatId, userId, state);
      return;
    }
    if (text && text !== "❌ Отмена") {
      if (!state.data.correctAnswers) state.data.correctAnswers = [];
      state.data.correctAnswers.push(text);
      const count = state.data.correctAnswers.length;
      const keyboard = {
        keyboard: [
          [{ text: "✅ Готово (минимум 1 ответ)" }],
          [{ text: "❌ Отмена" }],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      };
      await sendTelegramMessage(
        chatId,
        `✅ Ответ ${count} добавлен: "${text}"\n\nВведите еще один правильный ответ или нажмите "Готово":`,
        keyboard
      );
    }
    return;
  }

  // Обработка шагов для календаря
  if (state.step === "question" && state.type === "add_calendar") {
    const text = (message.text || message.caption || "").trim();
    if (text) {
      state.data.question = text;
      state.step = "options";
      const keyboard = {
        keyboard: [
          [{ text: "✅ Готово (минимум 2 варианта)" }],
          [{ text: "❌ Отмена" }],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      };
      await sendTelegramMessage(
        chatId,
        "📝 Шаг 2/4: Вопрос сохранен.\n\nВведите первый вариант ответа (минимум 2 варианта):",
        keyboard
      );
    }
    return;
  }

  // Обработка файлов (проверяем после текстовых шагов)
  if (state.step === "photo" && state.type === "add_face") {
    const fileId = extractImageFileId(message);
    if (fileId) {
      state.data.fileId = fileId; // Фотография части тела
      state.step = "fullPhoto";
      await sendTelegramMessage(
        chatId,
        "✅ Фотография части тела сохранена!\n\n📸 Шаг 4/4: Теперь прикрепите полную фотографию, откуда брали часть тела:",
        getCancelKeyboard()
      );
    } else {
      // Если файл не найден, но есть текст - это может быть ошибка
      const text = (message.text || message.caption || "").trim();
      if (text) {
        await sendTelegramMessage(
          chatId,
          "❌ На этом шаге нужна фотография, а не текст. Прикрепите фото.",
          getCancelKeyboard()
        );
      } else {
        await sendTelegramMessage(
          chatId,
          "❌ Прикрепите фотографию.",
          getCancelKeyboard()
        );
      }
    }
    return;
  }

  if (state.step === "fullPhoto" && state.type === "add_face") {
    const fileId = extractImageFileId(message);
    if (fileId) {
      state.data.fullImageFileId = fileId; // Полная фотография
      await sendTelegramMessage(chatId, "⏳ Загружаю фотографии...");
      await finalizeQuestion(chatId, userId, state);
    } else {
      // Если файл не найден, но есть текст - это может быть ошибка
      const text = (message.text || message.caption || "").trim();
      if (text) {
        await sendTelegramMessage(
          chatId,
          "❌ На этом шаге нужна фотография, а не текст. Прикрепите фото.",
          getCancelKeyboard()
        );
      } else {
        await sendTelegramMessage(
          chatId,
          "❌ Прикрепите полную фотографию.",
          getCancelKeyboard()
        );
      }
    }
    return;
  }

  if (
    state.step === "audio" &&
    (state.type === "add_melody" || state.type === "add_voice")
  ) {
    const fileInfo = extractAudioFile(message);
    if (fileInfo) {
      state.data.fileId = fileInfo.file_id;
      
      // Для "Угадай голос" переходим на шаг загрузки оригинала
      if (state.type === "add_voice") {
        state.step = "originalAudio";
        await sendTelegramMessage(
          chatId,
          "✅ Неестественный голос сохранен!\n\n📝 Шаг 4/4: Прикрепите оригинальный аудио/видео файл (необязательно)\n\nЭтот файл будет воспроизводиться после правильного ответа.\n\n📹 Можете прикрепить видео или аудио.\n\nЕсли не хотите добавлять оригинал, нажмите кнопку 'Пропустить'.",
          getSkipOrCancelKeyboard()
        );
      } else {
        // Для "Угадай мелодию" сразу финализируем
        await sendTelegramMessage(chatId, "⏳ Загружаю аудиофайл...");
        await finalizeQuestion(chatId, userId, state);
      }
    } else {
      // Если файл не найден, но есть текст - это может быть ошибка
      const text = (message.text || message.caption || "").trim();
      if (text) {
        await sendTelegramMessage(
          chatId,
          "❌ На этом шаге нужен аудиофайл (MP3 или OGA), а не текст. Прикрепите аудио.",
          getCancelKeyboard()
        );
      } else {
        await sendTelegramMessage(
          chatId,
          "❌ Прикрепите аудиофайл (MP3 или OGA).",
          getCancelKeyboard()
        );
      }
    }
    return;
  }

  if (state.step === "originalAudio" && state.type === "add_voice") {
    const text = (message.text || message.caption || "").trim();
    
    // Если пользователь нажал "Пропустить"
    if (text === "⏭ Пропустить") {
      await sendTelegramMessage(chatId, "⏳ Сохраняю вопрос...");
      await finalizeQuestion(chatId, userId, state);
      return;
    }
    
    const fileInfo = extractAudioOrVideoFile(message);
    if (fileInfo) {
      state.data.originalFileId = fileInfo.file_id;
      await sendTelegramMessage(chatId, "⏳ Загружаю файлы...");
      await finalizeQuestion(chatId, userId, state);
    } else {
      // Если файл не найден, но есть текст - это может быть ошибка
      if (text) {
        await sendTelegramMessage(
          chatId,
          "❌ На этом шаге нужен аудио/видео файл или нажмите 'Пропустить'.",
          getSkipOrCancelKeyboard()
        );
      } else {
        await sendTelegramMessage(
          chatId,
          "❌ Прикрепите оригинальный аудио/видео файл или нажмите 'Пропустить'.",
          getSkipOrCancelKeyboard()
        );
      }
    }
    return;
  }

  if (state.step === "waiting_file" && state.type === "add_icon") {
    const fileId = extractImageFileId(message);
    if (fileId) {
      await finalizeIcon(chatId, userId, state, fileId);
    } else {
      // Если файл не найден, но есть текст - это может быть ошибка
      const text = (message.text || message.caption || "").trim();
      if (text) {
        await sendTelegramMessage(
          chatId,
          "❌ На этом шаге нужно изображение, а не текст. Прикрепите PNG."
        );
      } else {
        await sendTelegramMessage(chatId, "❌ Прикрепите PNG изображение.");
      }
    }
    return;
  }
}

async function processStateStep(
  chatId: number,
  userId: number,
  state: UserState
) {
  if (state.step === "options") {
    await sendTelegramMessage(
      chatId,
      "📝 Введите первый вариант ответа (минимум 2 варианта):",
      getCancelKeyboard()
    );
  } else if (state.step === "correctAnswer") {
    const options = state.data.options || [];
    const optionsText = options
      .map((o: string, i: number) => `${i + 1}. ${o}`)
      .join("\n");
    let stepNumber = "2/3";
    if (state.type === "add_quote") {
      stepNumber = "4/5";
    } else if (state.type === "add_face") {
      stepNumber = "2/4";
    } else if (state.type === "add_melody" || state.type === "add_voice") {
      stepNumber = "2/3";
    }
    await sendTelegramMessage(
      chatId,
      `📝 Шаг ${stepNumber}: Выберите правильный ответ\n\nВарианты ответов:\n${optionsText}\n\n✅ Введите правильный ответ (точно как в списке):`,
      getCancelKeyboard()
    );
  } else if (state.step === "photo") {
    await sendTelegramMessage(
      chatId,
      "📝 Шаг 3/4: Прикрепите фотографию части тела (по которой угадывается человек):",
      getCancelKeyboard()
    );
  } else if (state.step === "fullPhoto") {
    await sendTelegramMessage(
      chatId,
      "📝 Шаг 4/4: Прикрепите полную фотографию, откуда брали часть тела:",
      getCancelKeyboard()
    );
  } else if (state.step === "audio") {
    let stepNumber = "3/3";
    const questionType = state.type === "add_melody" ? "мелодию" : "голос";
    
    if (state.type === "add_voice") {
      stepNumber = "3/4";
    }
    
    await sendTelegramMessage(
      chatId,
      `📝 Шаг ${stepNumber}: Прикрепите аудиофайл (MP3 или OGA) с ${questionType === "голос" ? "неестественным голосом" : questionType}:`,
      getCancelKeyboard()
    );
  } else if (state.step === "originalAudio" && state.type === "add_voice") {
    await sendTelegramMessage(
      chatId,
      "📝 Шаг 4/4: Прикрепите оригинальный аудио/видео файл (необязательно)\n\nЭтот файл будет воспроизводиться после правильного ответа.\n\n📹 Можете прикрепить видео или аудио.\n\nЕсли не хотите добавлять оригинал, нажмите 'Пропустить'.",
      getSkipOrCancelKeyboard()
    );
  } else if (state.step === "source") {
    await sendTelegramMessage(
      chatId,
      "📝 Шаг 5/5: Введите источник цитаты (например: Иоанна 3:16):",
      getCancelKeyboard()
    );
  } else if (state.step === "questionType" && state.type === "add_quote") {
    await sendTelegramMessage(
      chatId,
      "Выберите тип вопроса:",
      getQuestionTypeKeyboard("quote_type")
    );
  }
}

async function finalizeQuestion(
  chatId: number,
  userId: number,
  state: UserState
) {
  if (!state.type) {
    await sendTelegramMessage(chatId, "❌ Ошибка: тип вопроса не определен.");
    return;
  }

  try {
    if (state.type === "add_face") {
      if (state.data.options.length < 2) {
        await sendTelegramMessage(
          chatId,
          "❌ Нужно минимум 2 варианта ответа. Введите еще варианты."
        );
        state.step = "options";
        return;
      }
      await saveFaceQuestion(chatId, state);
    } else if (state.type === "add_melody") {
      if (state.data.options.length < 2) {
        await sendTelegramMessage(
          chatId,
          "❌ Нужно минимум 2 варианта ответа. Введите еще варианты."
        );
        state.step = "options";
        return;
      }
      await saveMelodyQuestion(chatId, state);
    } else if (state.type === "add_voice") {
      if (state.data.options.length < 2) {
        await sendTelegramMessage(
          chatId,
          "❌ Нужно минимум 2 варианта ответа. Введите еще варианты."
        );
        state.step = "options";
        return;
      }
      await saveVoiceQuestion(chatId, state);
    } else if (state.type === "add_quote") {
      if (!state.data.correctAnswers || state.data.correctAnswers.length < 1) {
        await sendTelegramMessage(
          chatId,
          "❌ Нужен минимум 1 правильный ответ. Введите ответ."
        );
        state.step = "correctAnswers";
        return;
      }
      await saveQuoteQuestion(chatId, state);
    } else if (state.type === "add_calendar") {
      if (state.data.options.length < 2) {
        await sendTelegramMessage(
          chatId,
          "❌ Нужно минимум 2 варианта ответа. Введите еще варианты."
        );
        state.step = "options";
        return;
      }
      await saveCalendarQuestion(chatId, state);
    }
    userStates.delete(userId);
  } catch (error) {
    console.error("[Telegram] Ошибка сохранения вопроса", error);
    await sendTelegramMessage(
      chatId,
      "❌ Ошибка при сохранении. Попробуйте снова."
    );
  }
}

async function finalizeIcon(
  chatId: number,
  userId: number,
  state: UserState,
  fileId: string
) {
  try {
    const file = await downloadTelegramFile(fileId);
    const extension = file.extension || "png";
    const objectPath = `icons/${state.data.roundId}.${extension}`;

    const publicUrl = await supabaseStorageUpload(
      objectPath,
      file.buffer,
      file.mimeType,
      {
        upsert: true,
      }
    );

    await supabaseRestRequest("round_icons", {
      method: "POST",
      searchParams: { on_conflict: "round_id" },
      headers: { Prefer: "resolution=merge-duplicates" },
      body: {
        round_id: state.data.roundId,
        icon_url: publicUrl,
        updated_at: new Date().toISOString(),
      },
    });

    userStates.delete(userId);

    // Отправляем изображение с подписью об успехе
    try {
      await sendTelegramPhoto(
        chatId,
        fileId,
        `✅ Иконка для "${state.data.roundId}" успешно обновлена!\n\nURL: ${publicUrl}`,
        getMainMenuKeyboard()
      );
    } catch (photoError) {
      // Если не удалось отправить фото, отправляем текстовое сообщение
      await sendTelegramMessage(
        chatId,
        `✅ Иконка для "${state.data.roundId}" успешно обновлена!\n\nURL: ${publicUrl}`,
        getMainMenuKeyboard()
      );
    }
  } catch (error) {
    console.error("[Telegram] Ошибка сохранения иконки", error);
    await sendTelegramMessage(
      chatId,
      `❌ Ошибка при сохранении иконки: ${
        error instanceof Error ? error.message : "Неизвестная ошибка"
      }`
    );
  }
}

async function saveFaceQuestion(chatId: number, state: UserState) {
  // Загружаем фотографию части тела
  const file = await downloadTelegramFile(state.data.fileId);
  const timestamp = Date.now();
  const extension = file.extension || "jpg";
  const objectPath = `images/faces/${state.data.difficulty}/${timestamp}_part.${extension}`;

  const publicUrl = await supabaseStorageUpload(
    objectPath,
    file.buffer,
    file.mimeType,
    {
      upsert: false,
    }
  );

  // Загружаем полную фотографию
  let fullImageUrl = publicUrl; // По умолчанию используем ту же фотографию, если не загружена отдельная
  if (state.data.fullImageFileId) {
    const fullFile = await downloadTelegramFile(state.data.fullImageFileId);
    const fullExtension = fullFile.extension || "jpg";
    const fullObjectPath = `images/faces/${state.data.difficulty}/${timestamp}_full.${fullExtension}`;
    fullImageUrl = await supabaseStorageUpload(
      fullObjectPath,
      fullFile.buffer,
      fullFile.mimeType,
      {
        upsert: false,
      }
    );
  }

  await supabaseRestRequest("guess_face_questions", {
    method: "POST",
    body: {
      difficulty: state.data.difficulty,
      image_url: publicUrl,
      full_image_url: fullImageUrl,
      parts: state.data.parts || ["nose", "eyes", "mouth", "hands", "full"],
      options: state.data.options,
      correct_answer: state.data.correctAnswer,
    },
  });

  await sendTelegramMessage(
    chatId,
    `✅ Вопрос "Угадай лицо" успешно добавлен!\n\n📸 Часть тела: ${publicUrl}\n📸 Полная фотография: ${fullImageUrl}`,
    getMainMenuKeyboard()
  );
}

async function saveMelodyQuestion(chatId: number, state: UserState) {
  const file = await downloadTelegramFile(state.data.fileId);
  const timestamp = Date.now();
  // Определяем расширение из имени файла или MIME типа
  let extension = file.extension?.toLowerCase();
  let mimeType = file.mimeType || "application/octet-stream";

  // Нормализуем расширения OGG в OGA
  if (extension === "oga" || extension === "ogg") {
    extension = "oga";
    if (!mimeType.includes("ogg")) {
      mimeType = "audio/ogg";
    }
  }

  if (!extension) {
    // Если расширение не определено, пытаемся определить по MIME типу
    const mimeLower = mimeType.toLowerCase();
    if (
      mimeLower.includes("ogg") ||
      mimeLower.includes("vorbis") ||
      mimeLower.includes("opus")
    ) {
      extension = "oga";
      mimeType = "audio/ogg";
    } else {
      extension = "mp3"; // По умолчанию MP3
      mimeType = "audio/mpeg";
    }
  }

  const objectPath = `audio/melodies/${state.data.difficulty}/${timestamp}.${extension}`;

  const publicUrl = await supabaseStorageUpload(
    objectPath,
    file.buffer,
    mimeType,
    {
      upsert: false,
    }
  );

  await supabaseRestRequest("guess_melody_questions", {
    method: "POST",
    body: {
      difficulty: state.data.difficulty,
      audio_url: publicUrl,
      options: state.data.options,
      correct_answer: state.data.correctAnswer,
    },
  });

  await sendTelegramMessage(
    chatId,
    `✅ Вопрос "Угадай мелодию" успешно добавлен!\n\n🎵 Аудио: ${publicUrl}`,
    getMainMenuKeyboard()
  );
}

async function saveVoiceQuestion(chatId: number, state: UserState) {
  const file = await downloadTelegramFile(state.data.fileId);
  const timestamp = Date.now();
  // Определяем расширение из имени файла или MIME типа
  let extension = file.extension?.toLowerCase();
  let mimeType = file.mimeType || "application/octet-stream";

  // Нормализуем расширения OGG в OGA
  if (extension === "oga" || extension === "ogg") {
    extension = "oga";
    if (!mimeType.includes("ogg")) {
      mimeType = "audio/ogg";
    }
  }

  if (!extension) {
    // Если расширение не определено, пытаемся определить по MIME типу
    const mimeLower = mimeType.toLowerCase();
    if (
      mimeLower.includes("ogg") ||
      mimeLower.includes("vorbis") ||
      mimeLower.includes("opus")
    ) {
      extension = "oga";
      mimeType = "audio/ogg";
    } else {
      extension = "mp3"; // По умолчанию MP3
      mimeType = "audio/mpeg";
    }
  }

  const objectPath = `audio/voices/${state.data.difficulty}/${timestamp}.${extension}`;

  const publicUrl = await supabaseStorageUpload(
    objectPath,
    file.buffer,
    mimeType,
    {
      upsert: false,
    }
  );

  // Загружаем оригинальный аудио/видео файл, если он был предоставлен
  let originalAudioUrl = null;
  if (state.data.originalFileId) {
    const originalFile = await downloadTelegramFile(state.data.originalFileId);
    let originalExtension = originalFile.extension?.toLowerCase();
    let originalMimeType = originalFile.mimeType || "application/octet-stream";
    
    // Определяем, является ли файл видео
    const isVideo = originalMimeType.startsWith("video/") ||
                    ["mp4", "webm", "mov", "avi"].includes(originalExtension || "");

    if (isVideo) {
      // Обработка видео
      if (!originalExtension) {
        const mimeLower = originalMimeType.toLowerCase();
        if (mimeLower.includes("mp4")) {
          originalExtension = "mp4";
        } else if (mimeLower.includes("webm")) {
          originalExtension = "webm";
        } else if (mimeLower.includes("quicktime")) {
          originalExtension = "mov";
        } else {
          originalExtension = "mp4"; // По умолчанию MP4
        }
      }
      
      const originalObjectPath = `audio/voices/${state.data.difficulty}/${timestamp}_original.${originalExtension}`;
      originalAudioUrl = await supabaseStorageUpload(
        originalObjectPath,
        originalFile.buffer,
        originalMimeType,
        {
          upsert: false,
        }
      );
    } else {
      // Обработка аудио
      // Нормализуем расширения OGG в OGA
      if (originalExtension === "oga" || originalExtension === "ogg") {
        originalExtension = "oga";
        if (!originalMimeType.includes("ogg")) {
          originalMimeType = "audio/ogg";
        }
      }

      if (!originalExtension) {
        const mimeLower = originalMimeType.toLowerCase();
        if (
          mimeLower.includes("ogg") ||
          mimeLower.includes("vorbis") ||
          mimeLower.includes("opus")
        ) {
          originalExtension = "oga";
          originalMimeType = "audio/ogg";
        } else {
          originalExtension = "mp3";
          originalMimeType = "audio/mpeg";
        }
      }

      const originalObjectPath = `audio/voices/${state.data.difficulty}/${timestamp}_original.${originalExtension}`;
      originalAudioUrl = await supabaseStorageUpload(
        originalObjectPath,
        originalFile.buffer,
        originalMimeType,
        {
          upsert: false,
        }
      );
    }
  }

  await supabaseRestRequest("guess_voice_questions", {
    method: "POST",
    body: {
      difficulty: state.data.difficulty,
      audio_url: publicUrl,
      original_audio_url: originalAudioUrl,
      options: state.data.options,
      correct_answer: state.data.correctAnswer,
    },
  });

  let message = `✅ Вопрос "Угадай голос" успешно добавлен!\n\n🎤 Неестественный голос: ${publicUrl}`;
  
  if (originalAudioUrl) {
    const isVideo = originalAudioUrl.endsWith('.mp4') || 
                    originalAudioUrl.endsWith('.webm') || 
                    originalAudioUrl.endsWith('.mov') ||
                    originalAudioUrl.endsWith('.avi');
    
    message += isVideo 
      ? `\n🎬 Оригинальное видео: ${originalAudioUrl}`
      : `\n🎵 Оригинальный голос: ${originalAudioUrl}`;
  }

  await sendTelegramMessage(chatId, message, getMainMenuKeyboard());
}

async function saveQuoteQuestion(chatId: number, state: UserState) {
  await supabaseRestRequest("bible_quote_questions", {
    method: "POST",
    body: {
      difficulty: state.data.difficulty,
      quote: state.data.question,
      question_type: "source",
      options: state.data.correctAnswers,
      correct_answer: state.data.correctAnswers[0],
      source: "",
    },
  });

  await sendTelegramMessage(
    chatId,
    `✅ Библейская цитата успешно добавлена!\n\nВопрос: ${state.data.question}\nОтвет: ${state.data.correctAnswers[0]}`,
    getMainMenuKeyboard()
  );
}

async function saveCalendarQuestion(chatId: number, state: UserState) {
  await supabaseRestRequest("calendar_questions", {
    method: "POST",
    body: {
      difficulty: state.data.difficulty,
      question: state.data.question,
      options: state.data.options,
      correct_answer: state.data.correctAnswer,
    },
  });

  await sendTelegramMessage(
    chatId,
    `✅ Вопрос для Календаря успешно добавлен!`,
    getMainMenuKeyboard()
  );
}

async function handleLoginStep(message: TelegramMessage, state: UserState) {
  const chatId = message.chat.id;
  const userId = message.from?.id;

  if (!userId) {
    await sendTelegramMessage(chatId, "Не удалось определить пользователя.");
    return;
  }

  if (state.step === "password") {
    const password = (message.text || message.caption || "").trim();

    if (!password) {
      await sendTelegramMessage(
        chatId,
        "❌ Введите пароль:",
        getCancelKeyboard()
      );
      return;
    }

    if (!isSupabaseEnabled()) {
      const supabaseUrl = process.env.SUPABASE_URL || "";
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

      const missing = [];
      if (!supabaseUrl) missing.push("SUPABASE_URL");
      if (!supabaseServiceKey && !supabaseAnonKey) {
        missing.push("SUPABASE_SERVICE_ROLE_KEY или SUPABASE_ANON_KEY");
      }

      await sendTelegramMessage(
        chatId,
        "❌ База данных Supabase не настроена.\n\n" +
          `Отсутствуют: ${missing.join(", ")}\n\n` +
          "Для работы бота нужна база данных Supabase (для хранения сессий и вопросов).\n" +
          "Vercel Blob Storage используется только для файлов (иконки, фото, аудио).\n\n" +
          "⚠️ Если проект на Vercel, задайте переменные в:\n" +
          "Vercel Dashboard → Settings → Environment Variables",
        getMainMenuKeyboard()
      );
      userStates.delete(userId);
      return;
    }

    if (!TELEGRAM_ADMIN_PASSWORD) {
      await sendTelegramMessage(
        chatId,
        "Пароль администратора не задан на сервере.",
        getMainMenuKeyboard()
      );
      userStates.delete(userId);
      return;
    }

    if (password !== TELEGRAM_ADMIN_PASSWORD) {
      await sendTelegramMessage(
        chatId,
        "❌ Неверный пароль. Попробуйте снова:",
        getCancelKeyboard()
      );
      return;
    }

    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

    try {
      await supabaseDelete("admin_sessions", {
        telegram_user_id: `eq.${userId}`,
      });
    } catch {
      // Игнорируем отсутствие записей
    }

    const result = await supabaseRestRequest("admin_sessions", {
      method: "POST",
      body: {
        telegram_user_id: userId,
        expires_at: expiresAt,
      },
    });

    console.log(
      `[Telegram] Сессия сохранена для userId: ${userId}, expires_at: ${expiresAt}, результат:`,
      result
    );

    // Небольшая задержка для обеспечения консистентности Supabase
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Проверяем, что сессия действительно сохранилась
    const verifySessions = await supabaseRestRequest<any[]>("admin_sessions", {
      searchParams: {
        select: "expires_at",
        telegram_user_id: `eq.${userId}`,
        order: "expires_at.desc",
        limit: "1",
      },
    });

    if (!verifySessions || verifySessions.length === 0) {
      console.error(
        `[Telegram] ОШИБКА: Сессия не найдена сразу после сохранения для userId: ${userId}`
      );
      await sendTelegramMessage(
        chatId,
        "⚠️ Сессия сохранена, но требуется повторная проверка. Попробуйте выполнить действие еще раз.",
        getMainMenuKeyboard()
      );
      return;
    }

    userStates.delete(userId);
    await sendTelegramMessage(
      chatId,
      "✅ Успешный вход! Сессия активна 12 часов.",
      getMainMenuKeyboard()
    );
  }
}

async function handleLogout(message: TelegramMessage) {
  const chatId = message.chat.id;
  const userId = message.from?.id;

  if (!userId) {
    await sendTelegramMessage(
      chatId,
      "Не удалось определить пользователя.",
      getMainMenuKeyboard()
    );
    return;
  }

  if (!isSupabaseEnabled()) {
    await sendTelegramMessage(
      chatId,
      "❌ База данных Supabase не настроена. Настройте SUPABASE_URL и ключи.",
      getMainMenuKeyboard()
    );
    return;
  }

  await supabaseDelete("admin_sessions", {
    telegram_user_id: `eq.${userId}`,
  });

  await sendTelegramMessage(
    chatId,
    "✅ Вы вышли из панели администратора.",
    getMainMenuKeyboard()
  );
}

async function ensureAuthorized(message: TelegramMessage) {
  const userId = message.from?.id;
  const chatId = message.chat.id;

  if (!userId) {
    await sendTelegramMessage(chatId, "Не удалось определить пользователя.");
    return false;
  }

  if (!isSupabaseEnabled()) {
    await sendTelegramMessage(
      chatId,
      "❌ База данных Supabase не настроена. Настройте SUPABASE_URL и ключи для работы бота."
    );
    return false;
  }

  try {
    const sessions = await supabaseRestRequest<any[]>("admin_sessions", {
      searchParams: {
        select: "expires_at",
        telegram_user_id: `eq.${userId}`,
        order: "expires_at.desc",
        limit: "1",
      },
    });

    console.log(
      `[Telegram] Проверка сессии для userId: ${userId}, найдено сессий: ${
        sessions?.length || 0
      }`
    );

    const session = sessions?.[0];
    if (!session) {
      console.log(`[Telegram] Сессия не найдена для userId: ${userId}`);
      await sendTelegramMessage(
        chatId,
        '🔐 Требуется авторизация. Нажмите кнопку "Войти" в меню.',
        getMainMenuKeyboard()
      );
      return false;
    }

    const expiresAt = new Date(session.expires_at).getTime();
    const now = Date.now();
    console.log(
      `[Telegram] Сессия найдена, expires_at: ${
        session.expires_at
      }, сейчас: ${new Date().toISOString()}, истекла: ${expiresAt < now}`
    );

    if (expiresAt < now) {
      console.log(`[Telegram] Сессия истекла для userId: ${userId}`);
      await sendTelegramMessage(
        chatId,
        '🔐 Требуется авторизация. Нажмите кнопку "Войти" в меню.',
        getMainMenuKeyboard()
      );
      return false;
    }

    // 🔥 ПРАВИЛЬНОЕ МЕСТО ДЛЯ ОБНОВЛЕНИЯ СЕССИИ
    await updateAdminSession(userId);
    console.log(`[Telegram] Авторизация успешна для userId: ${userId}`);
    return true;
  } catch (error) {
    console.error("[Telegram] Проверка авторизации", error);
    await sendTelegramMessage(
      chatId,
      "Не удалось проверить авторизацию. Попробуйте позже."
    );
    return false;
  }
}

function extractImageFileId(message: TelegramMessage) {
  if (message.photo && message.photo.length > 0) {
    return message.photo[message.photo.length - 1].file_id;
  }
  if (message.document && message.document.mime_type?.startsWith("image/")) {
    return message.document.file_id;
  }
  return null;
}

function extractAudioFile(message: TelegramMessage) {
  if (message.audio) {
    return message.audio;
  }
  if (message.voice) {
    return message.voice;
  }
  if (message.document && message.document.mime_type) {
    const mimeType = message.document.mime_type.toLowerCase();
    // Поддерживаем MP3, OGG и другие аудио форматы
    if (
      mimeType.startsWith("audio/") ||
      mimeType === "audio/mpeg" ||
      mimeType === "audio/mp3" ||
      mimeType === "audio/ogg" ||
      mimeType === "audio/vorbis" ||
      mimeType === "audio/opus"
    ) {
      return message.document;
    }
  }
  return null;
}

function extractAudioOrVideoFile(message: TelegramMessage) {
  // Сначала пытаемся извлечь аудио
  const audioFile = extractAudioFile(message);
  if (audioFile) {
    return audioFile;
  }
  
  // Затем пытаемся извлечь видео
  if (message.video) {
    return message.video;
  }
  if (message.video_note) {
    return message.video_note;
  }
  if (message.document && message.document.mime_type) {
    const mimeType = message.document.mime_type.toLowerCase();
    // Поддерживаем видео форматы
    if (
      mimeType.startsWith("video/") ||
      mimeType === "video/mp4" ||
      mimeType === "video/webm" ||
      mimeType === "video/quicktime" ||
      mimeType === "video/x-msvideo"
    ) {
      return message.document;
    }
  }
  return null;
}

async function downloadTelegramFile(fileId: string) {
  const fileResponse = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`
  );
  const fileResult = await fileResponse.json();
  if (!fileResult.ok) {
    throw new Error("Не удалось получить файл из Telegram");
  }

  const filePath = fileResult.result.file_path;
  const downloadResponse = await fetch(
    `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`
  );
  if (!downloadResponse.ok) {
    throw new Error("Не удалось скачать файл из Telegram");
  }

  const arrayBuffer = await downloadResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = filePath.split(".").pop();
  const mimeType =
    downloadResponse.headers.get("content-type") || "application/octet-stream";

  return { buffer, extension, mimeType };
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
    };

    if (keyboard) {
      payload.reply_markup = keyboard;
    }

    if (replyToMessageId) {
      payload.reply_to_message_id = replyToMessageId;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const result = await response.json();
    if (!result.ok) {
      console.error("[Telegram] Ошибка отправки сообщения:", result);
    } else {
      console.log("[Telegram] Сообщение отправлено в", chatId);
    }
  } catch (error) {
    console.error("[Telegram] Ошибка отправки сообщения", error);
    if (error instanceof Error) {
      console.error("[Telegram] Stack:", error.stack);
    }
  }
}

async function sendTelegramPhoto(
  chatId: number,
  photoFileId: string,
  caption?: string,
  keyboard?: any
) {
  try {
    const payload: any = {
      chat_id: chatId,
      photo: photoFileId,
    };

    if (caption) {
      payload.caption = caption;
    }

    if (keyboard) {
      payload.reply_markup = keyboard;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const result = await response.json();
    if (!result.ok) {
      console.error("[Telegram] Ошибка отправки фото:", result);
      throw new Error(result.description || "Failed to send photo");
    } else {
      console.log("[Telegram] Фото отправлено в", chatId);
    }
  } catch (error) {
    console.error("[Telegram] Ошибка отправки фото", error);
    throw error;
  }
}

async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert = false
) {
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text,
          show_alert: showAlert,
        }),
      }
    );
  } catch (error) {
    console.error("[Telegram] Ошибка ответа на callback", error);
  }
}

function getMainMenuKeyboard() {
  return {
    keyboard: [
      [{ text: "👤 Угадай лицо" }, { text: "🎵 Угадай мелодию" }],
      [{ text: "🎤 Угадай голос" }, { text: "📖 Библейская цитата" }],
      [{ text: "📅 Календарь" }, { text: "🖼️ Добавить иконку" }],
      [{ text: "📊 Статус" }, { text: "🔐 Войти" }, { text: "🚪 Выйти" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

// Функция getDifficultyKeyboard удалена - сложность больше не выбирается

function getQuestionTypeKeyboard(callbackPrefix: string) {
  return {
    keyboard: [
      [{ text: "📖 Источник" }, { text: "➡️ Продолжить" }],
      [{ text: "❌ Отмена" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

function getRoundIconKeyboard() {
  return {
    keyboard: [
      [{ text: "👤 Угадай лицо" }, { text: "🎵 Угадай мелодию" }],
      [{ text: "📖 Библейские цитаты" }, { text: "🎤 Угадай голос" }],
      [{ text: "📅 Календарь" }, { text: "❌ Отмена" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

function getAddQuestionTypeKeyboard() {
  return {
    keyboard: [
      [{ text: "👤 Угадай лицо" }, { text: "🎵 Угадай мелодию" }],
      [{ text: "🎤 Угадай голос" }, { text: "📖 Библейская цитата" }],
      [{ text: "❌ Отмена" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

function getCancelKeyboard() {
  return {
    keyboard: [[{ text: "❌ Отмена" }]],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

function getSkipOrCancelKeyboard() {
  return {
    keyboard: [[{ text: "⏭ Пропустить" }], [{ text: "❌ Отмена" }]],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

async function handleStatus(chatId: number) {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
  const supabaseOk = isSupabaseEnabled();
  const blobOk = isVercelBlobEnabled();

  const missingSupabase = [];
  if (!supabaseUrl) missingSupabase.push("SUPABASE_URL");
  if (!supabaseServiceKey && !supabaseAnonKey) {
    missingSupabase.push("SUPABASE_SERVICE_ROLE_KEY или SUPABASE_ANON_KEY");
  }

  const status = [
    "📊 Статус системы:",
    "",
    `✅ Telegram бот: ${TELEGRAM_BOT_TOKEN ? "настроен" : "❌ не настроен"}`,
    "",
    `✅ Supabase (БД): ${supabaseOk ? "настроен ✅" : "❌ не настроен"}`,
    ...(supabaseOk
      ? []
      : [
          `   Отсутствуют: ${missingSupabase.join(", ")}`,
          `   SUPABASE_URL: ${supabaseUrl ? "✅ есть" : "❌ нет"} (длина: ${
            supabaseUrl.length
          })`,
          `   Ключи: ${
            supabaseServiceKey || supabaseAnonKey ? "✅ есть" : "❌ нет"
          }`,
        ]),
    "",
    `✅ Vercel Blob (файлы): ${blobOk ? "настроен ✅" : "❌ не настроен"}`,
    `   ${blobOk ? "" : "   Нужен: BLOB_READ_WRITE_TOKEN"}`,
    "",
    `✅ Пароль админа: ${TELEGRAM_ADMIN_PASSWORD ? "задан ✅" : "❌ не задан"}`,
    "",
    supabaseOk
      ? "✅ Бот готов к работе"
      : "❌ Для работы бота нужна база данных Supabase",
    "",
    blobOk
      ? "💾 Файлы будут сохраняться в Vercel Blob"
      : supabaseOk
      ? "💾 Файлы будут сохраняться в Supabase Storage"
      : "⚠️ Хранилище не настроено",
  ].join("\n");
  await sendTelegramMessage(chatId, status);
}

function getWelcomeText() {
  return (
    '👋 Привет! Это админ-бот "Рождественские Тайны"\n\n' +
    "Используйте кнопки ниже для навигации."
  );
}
