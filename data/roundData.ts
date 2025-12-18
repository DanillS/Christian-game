import { guessFaceData } from './guessFaceData'
import { bibleQuotesData } from './bibleQuotesData'
import { guessVoiceData } from './guessVoiceData'

export function getRoundData(roundId: string) {
  switch (roundId) {
    case 'guess-face':
      return guessFaceData || []
    case 'bible-quotes':
      return bibleQuotesData || []
    case 'guess-voice':
      return guessVoiceData || []
    default:
      return []
  }
}

