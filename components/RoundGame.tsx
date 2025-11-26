'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GuessFaceGame from './games/GuessFaceGame'
import GuessMelodyGame from './games/GuessMelodyGame'
import BibleQuotesGame from './games/BibleQuotesGame'
import GuessVoiceGame from './games/GuessVoiceGame'
import CalendarGame from './games/CalendarGame'
import { getRoundData } from '@/data/roundData'

interface RoundGameProps {
  roundId: string
  initialQuestionIndex: number
  onBack: () => void
  onQuestionComplete: (newIndex: number) => void
}

export default function RoundGame({
  roundId,
  initialQuestionIndex,
  onBack,
  onQuestionComplete,
}: RoundGameProps) {
  const [currentIndex, setCurrentIndex] = useState(initialQuestionIndex)
  const [score, setScore] = useState(0)
  const [usedQuestions, setUsedQuestions] = useState<number[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setScore(0)
  }, [roundId])

  useEffect(() => {
    let ignore = false
    const loadQuestions = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/round-data/${roundId}`)
        if (!response.ok) {
          throw new Error('Failed to load round data')
        }
        const payload = await response.json()
        if (!ignore) {
          const apiQuestions = Array.isArray(payload.questions) ? payload.questions : []
          if (apiQuestions.length > 0) {
            setQuestions(apiQuestions)
          } else {
            // Fallback на локальные данные
            const localData = getRoundData(roundId)
            setQuestions(localData)
          }
        }
      } catch (error) {
        console.error('[RoundGame] Ошибка загрузки вопросов', error)
        if (!ignore) {
          // Fallback на локальные данные
          const localData = getRoundData(roundId)
          setQuestions(localData)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadQuestions()

    return () => {
      ignore = true
    }
  }, [roundId])

  useEffect(() => {
    const saved = localStorage.getItem(`used-${roundId}`)
    if (saved) {
      setUsedQuestions(JSON.parse(saved))
    } else {
      setUsedQuestions([])
    }
  }, [roundId])

  useEffect(() => {
    setCurrentIndex(initialQuestionIndex)
  }, [initialQuestionIndex])

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
      localStorage.removeItem(`used-${roundId}`)
      setCurrentIndex(0)
      onQuestionComplete(0)
    } else {
      setUsedQuestions(newUsed)
      localStorage.setItem(`used-${roundId}`, JSON.stringify(newUsed))
      
      // Переходим к следующему вопросу (сбрасываем индекс, так как список доступных вопросов изменится)
      setCurrentIndex(0)
      onQuestionComplete(0)
    }
  }

  const currentQuestion =
    availableQuestions.length > 0
      ? availableQuestions[currentIndex % availableQuestions.length]
      : null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-2xl mb-4">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-2xl mb-4">Пока нет вопросов.</p>
          <button
            onClick={onBack}
            className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all backdrop-blur-md"
          >
            ← Назад
          </button>
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
      case 'calendar':
        return (
          <CalendarGame
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-[600px] md:min-h-[800px] flex flex-col items-center justify-center px-4 py-6 md:py-8 relative">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg transition-all backdrop-blur-md text-sm md:text-base"
        >
          ← Назад
        </motion.button>
        <div className="bg-white/20 backdrop-blur-md text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm md:text-base">
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

