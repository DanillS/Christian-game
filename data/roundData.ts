import { guessFaceData } from './guessFaceData'
import { guessMelodyData } from './guessMelodyData'
import { bibleQuotesData } from './bibleQuotesData'
import { guessVoiceData } from './guessVoiceData'
import { calendarData } from './calendarData'

export function getRoundData(roundId: string) {
  switch (roundId) {
    case 'guess-face':
      return guessFaceData || []
    case 'guess-melody':
      return guessMelodyData || []
    case 'bible-quotes':
      return bibleQuotesData || []
    case 'guess-voice':
      return guessVoiceData || []
    case 'calendar':
      return calendarData || []
    default:
      return []
  }
}

