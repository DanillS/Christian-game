'use client'

import { useState, useEffect, useMemo } from 'react'
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

  // Используем useMemo для вычисления доступных вопросов без побочных эффектов
  const availableQuestions = useMemo(() => {
    if (questions.length === 0) return []
    
    // Если все вопросы использованы, возвращаем все вопросы
    if (usedQuestions.length >= questions.length && questions.length > 0) {
      return questions
    }
    
    return questions.filter((_, index) => !usedQuestions.includes(index))
  }, [questions, usedQuestions])

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 10)
    }
    
    if (availableQuestions.length === 0 || questions.length === 0) return
    
    const currentQuestion = availableQuestions[currentIndex % availableQuestions.length]
    const originalIndex = questions.indexOf(currentQuestion)
    
    if (originalIndex === -1) return
    
    // Добавляем вопрос в использованные
    const newUsed = [...usedQuestions, originalIndex]
    
    // Если все вопросы использованы, сбрасываем список
    if (newUsed.length >= questions.length) {
      setUsedQuestions([])
      localStorage.removeItem(`used-${roundId}-${difficulty}`)
      setCurrentIndex(0)
      onQuestionComplete(0)
    } else {
      setUsedQuestions(newUsed)
      localStorage.setItem(`used-${roundId}-${difficulty}`, JSON.stringify(newUsed))
      
      // Переходим к следующему вопросу (сбрасываем индекс, так как список доступных вопросов изменится)
      setCurrentIndex(0)
      onQuestionComplete(0)
    }
  }

  const currentQuestion = availableQuestions.length > 0 
    ? availableQuestions[currentIndex % availableQuestions.length] 
    : null

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

