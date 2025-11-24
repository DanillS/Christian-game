import { bibleQuotesData } from '@/data/bibleQuotesData'
import { calendarData } from '@/data/calendarData'
import { guessFaceData } from '@/data/guessFaceData'
import { guessMelodyData } from '@/data/guessMelodyData'
import { guessVoiceData } from '@/data/guessVoiceData'
import { isSupabaseEnabled, supabaseRestRequest } from './supabaseClient'

type Difficulty = 'easy' | 'medium' | 'hard'
type RoundId = 'guess-face' | 'guess-melody' | 'bible-quotes' | 'guess-voice' | 'calendar'

const fallbackMap: Record<RoundId, Record<string, any[]>> = {
  'guess-face': guessFaceData,
  'guess-melody': guessMelodyData,
  'bible-quotes': bibleQuotesData,
  'guess-voice': guessVoiceData,
  calendar: calendarData,
}

const tableMap: Partial<Record<RoundId, string>> = {
  'guess-face': 'guess_face_questions',
  'guess-melody': 'guess_melody_questions',
  'bible-quotes': 'bible_quote_questions',
  'guess-voice': 'guess_voice_questions',
}

export async function loadRoundData(roundId: string, difficulty: string) {
  const normalizedRound = (roundId as RoundId) || 'guess-face'
  const normalizedDifficulty = (difficulty as Difficulty) || 'easy'
  const fallback = fallbackMap[normalizedRound]?.[normalizedDifficulty] || []

  if (!isSupabaseEnabled() || !tableMap[normalizedRound]) {
    return fallback
  }

  try {
    const rows = await supabaseRestRequest<any[]>(tableMap[normalizedRound] as string, {
      searchParams: {
        select: '*',
        difficulty: `eq.${normalizedDifficulty}`,
        order: 'created_at.asc',
      },
    })

    if (!rows || rows.length === 0) {
      return fallback
    }

    return rows.map((row) => mapRow(normalizedRound, row))
  } catch (error) {
    console.error('[roundDataLoader] Fallback to static data:', error)
    return fallback
  }
}

function mapRow(roundId: RoundId, row: any) {
  switch (roundId) {
    case 'guess-face':
      return {
        image: row.image_url,
        parts: row.parts || ['nose', 'eyes', 'mouth', 'hands', 'full'],
        options: row.options || [],
        correctAnswer: row.correct_answer,
      }
    case 'guess-melody':
      return {
        audioUrl: row.audio_url,
        options: row.options || [],
        correctAnswer: row.correct_answer,
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
        options: row.options || [],
        correctAnswer: row.correct_answer,
      }
    default:
      return row
  }
}

