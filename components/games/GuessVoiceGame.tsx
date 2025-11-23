'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface GuessVoiceGameProps {
  question: any
  onAnswer: (isCorrect: boolean) => void
}

export default function GuessVoiceGame({ question, onAnswer }: GuessVoiceGameProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleSelect = (answer: string) => {
    if (showResult) return
    setSelectedAnswer(answer)
    const isCorrect = answer === question.correctAnswer
    setShowResult(true)
    handlePause()
    
    setTimeout(() => {
      onAnswer(isCorrect)
      setSelectedAnswer(null)
      setShowResult(false)
      if (audioRef.current) {
        audioRef.current.currentTime = 0
      }
    }, 2000)
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border-2 border-yellow-400/30">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
        Угадай, кто говорит
      </h2>

      <div className="mb-6 flex flex-col items-center">
        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-4">
          <span className="text-6xl">🎤</span>
        </div>
        
        {question.audioUrl && (
          <>
            <audio
              ref={audioRef}
              src={question.audioUrl}
              onEnded={() => setIsPlaying(false)}
            />
            <div className="flex gap-4">
              <motion.button
                onClick={isPlaying ? handlePause : handlePlay}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg text-lg font-semibold"
              >
                {isPlaying ? '⏸ Пауза' : '▶ Воспроизвести'}
              </motion.button>
            </div>
            <p className="text-white/60 text-sm mt-2 text-center">
              Звук может быть неестественным
            </p>
          </>
        )}

        {!question.audioUrl && (
          <p className="text-white/80 text-center">
            Аудиофайл не загружен. Добавьте файл в data/guessVoiceData.ts
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option: string) => (
          <motion.button
            key={option}
            onClick={() => handleSelect(option)}
            disabled={showResult}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-lg text-lg font-semibold transition-all ${
              showResult && selectedAnswer === option
                ? option === question.correctAnswer
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                : showResult && option === question.correctAnswer
                ? 'bg-green-500 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            } disabled:opacity-50`}
          >
            {option}
          </motion.button>
        ))}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p className={`text-2xl font-bold ${
            selectedAnswer === question.correctAnswer ? 'text-green-400' : 'text-red-400'
          }`}>
            {selectedAnswer === question.correctAnswer ? '✓ Правильно!' : '✗ Неправильно'}
          </p>
        </motion.div>
      )}
    </div>
  )
}

