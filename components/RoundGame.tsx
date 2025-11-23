'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GuessFaceGame from './games/GuessFaceGame'
import GuessMelodyGame from './games/GuessMelodyGame'
import BibleQuotesGame from './games/BibleQuotesGame'
import GuessVoiceGame from './games/GuessVoiceGame'
import { getRoundData } from '@/data/roundData'

interface RoundGameProps {
  roundId: string
  difficulty: string
  initialQuestionIndex: number
  onBack: () => void
  onQuestionComplete: (newIndex: number) => void
}

export default function RoundGame({
  roundId,
  difficulty,
  initialQuestionIndex,
  onBack,
  onQuestionComplete,
}: RoundGameProps) {
  const [currentIndex, setCurrentIndex] = useState(initialQuestionIndex)
  const [score, setScore] = useState(0)
  const [usedQuestions, setUsedQuestions] = useState<number[]>([])
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    const data = getRoundData(roundId, difficulty)
    setQuestions(data)
    // Загружаем использованные вопросы
    const saved = localStorage.getItem(`used-${roundId}-${difficulty}`)
    if (saved) {
      setUsedQuestions(JSON.parse(saved))
    }
  }, [roundId, difficulty])

  const getAvailableQuestions = () => {
    if (usedQuestions.length >= questions.length) {
      // Все вопросы использованы, перемешиваем заново
      setUsedQuestions([])
      localStorage.removeItem(`used-${roundId}-${difficulty}`)
      return questions
    }
    return questions.filter((_, index) => !usedQuestions.includes(index))
  }

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 10)
    }
    
    const available = getAvailableQuestions()
    const currentQuestion = available[currentIndex % available.length]
    const originalIndex = questions.indexOf(currentQuestion)
    
    // Добавляем вопрос в использованные
    const newUsed = [...usedQuestions, originalIndex]
    setUsedQuestions(newUsed)
    localStorage.setItem(`used-${roundId}-${difficulty}`, JSON.stringify(newUsed))
    
    // Переходим к следующему вопросу
    const nextIndex = (currentIndex + 1) % available.length
    setCurrentIndex(nextIndex)
    onQuestionComplete(nextIndex)
  }

  const availableQuestions = getAvailableQuestions()
  const currentQuestion = availableQuestions[currentIndex % availableQuestions.length]

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-2xl mb-4">Загрузка...</p>
        </div>
      </div>
    )
  }

  const renderGame = () => {
    switch (roundId) {
      case 'guess-face':
        return (
          <GuessFaceGame
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        )
      case 'guess-melody':
        return (
          <GuessMelodyGame
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        )
      case 'bible-quotes':
        return (
          <BibleQuotesGame
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        )
      case 'guess-voice':
        return (
          <GuessVoiceGame
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all backdrop-blur-md"
        >
          ← Назад
        </motion.button>
        <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg">
          Очки: <span className="font-bold">{score}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-4xl"
        >
          {renderGame()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

