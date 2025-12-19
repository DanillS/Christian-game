import { bibleQuotesData } from '@/data/bibleQuotesData'
import { guessFaceData } from '@/data/guessFaceData'
import { guessVoiceData } from '@/data/guessVoiceData'
import { isSupabaseEnabled, supabaseRestRequest } from './supabaseClient'

type RoundId = 'guess-face' | 'bible-quotes' | 'guess-voice'

const fallbackMap: Record<RoundId, any[]> = {
  'guess-face': guessFaceData,
  'bible-quotes': bibleQuotesData,
  'guess-voice': guessVoiceData,
}

const tableMap: Partial<Record<RoundId, string>> = {
  'guess-face': 'guess_face_questions',
  'bible-quotes': 'bible_quote_questions',
  'guess-voice': 'guess_voice_questions',
}

export async function loadRoundData(roundId: string) {
  const normalizedRound = (roundId as RoundId) || 'guess-face'
  const fallback = fallbackMap[normalizedRound] || []

  // Если Supabase не настроен или нет таблицы - возвращаем локальные данные
  if (!isSupabaseEnabled() || !tableMap[normalizedRound]) {
    return fallback
  }

  try {
    // Уменьшаем таймаут до 2 секунд для быстрого ответа
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 2000)
    )

    const rows = await Promise.race([
      supabaseRestRequest<any[]>(tableMap[normalizedRound] as string, {
        searchParams: {
          select: '*',
          order: 'created_at.asc',
        },
      }),
      timeoutPromise,
    ]) as any[]

    if (!rows || rows.length === 0) {
      return fallback
    }

    return rows.map((row) => mapRow(normalizedRound, row))
  } catch (error) {
    // В случае ошибки сразу возвращаем локальные данные
    return fallback
  }
}

function mapRow(roundId: RoundId, row: any) {
  switch (roundId) {
    case 'guess-face':
      return {
        image: row.image_url,
        fullImage: row.full_image_url || row.image_url, // Если нет full_image_url, используем image_url
        parts: row.parts || ['nose', 'eyes', 'mouth', 'hands', 'full'],
        options: row.options || [],
        correctAnswer: row.correct_answer,
        correctAnswers: row.correct_answers || (row.correct_answer ? (row.correct_answer.includes(" | ") ? row.correct_answer.split(" | ") : [row.correct_answer]) : []),
      }
    case 'bible-quotes':
      return {
        quote: row.quote,
        questionType: row.question_type,
        options: row.options || [],
        correctAnswer: row.correct_answer,
        source: row.source,
      }
    case 'guess-voice':
      return {
        audioUrl: row.audio_url,
        originalAudioUrl: row.original_audio_url,
        options: row.options || [],
        correctAnswer: row.correct_answer,
        correctAnswers: row.correct_answers || (row.correct_answer ? (row.correct_answer.includes(" | ") ? row.correct_answer.split(" | ") : [row.correct_answer]) : []),
      }
    default:
      return row
  }
}

