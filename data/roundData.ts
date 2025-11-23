import { guessFaceData } from './guessFaceData'
import { guessMelodyData } from './guessMelodyData'
import { bibleQuotesData } from './bibleQuotesData'
import { guessVoiceData } from './guessVoiceData'
import { calendarData } from './calendarData'

export function getRoundData(roundId: string, difficulty: string) {
  switch (roundId) {
    case 'guess-face':
      return guessFaceData[difficulty] || []
    case 'guess-melody':
      return guessMelodyData[difficulty] || []
    case 'bible-quotes':
      return bibleQuotesData[difficulty] || []
    case 'guess-voice':
      return guessVoiceData[difficulty] || []
    case 'calendar':
      return calendarData[difficulty] || []
    default:
      return []
  }
}

