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
  const [usedQuestions, setUsedQuestions] = useState<number[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [answers, setAnswers] = useState<Map<number, string>>(new Map()) // Сохраняем правильный ответ для каждого вопроса
  const [wrongAnswers, setWrongAnswers] = useState<Map<number, string[]>>(new Map()) // Сохраняем все неправильные ответы для каждого вопроса


  useEffect(() => {
    let ignore = false
    const loadQuestions = async () => {
      setIsLoading(true)
      try {
        // Добавляем cache-busting параметр для избежания кеширования старых данных
        const cacheBuster = `?t=${Date.now()}`
        const response = await fetch(`/api/round-data/${roundId}${cacheBuster}`, {
          cache: 'no-store',
        })
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

  // Для guess-face используем все вопросы для навигации, но фильтруем только для выбора новых
  const availableQuestions = useMemo(() => {
    if (questions.length === 0) return []
    
    // Для guess-face показываем все вопросы для навигации
    if (roundId === 'guess-face') {
      return questions
    }
    
    // Для остальных раундов фильтруем использованные
    if (usedQuestions.length >= questions.length && questions.length > 0) {
      return questions
    }
    
    return questions.filter((_, index) => !usedQuestions.includes(index))
  }, [questions, usedQuestions, roundId])

  const handleAnswer = (answer: string, isCorrect: boolean) => {
    if (questions.length === 0) return
    
    // Для guess-face используем currentIndex напрямую из questions
    const originalIndex = roundId === 'guess-face' 
      ? currentIndex % questions.length
      : (() => {
          const currentQuestion = availableQuestions[currentIndex % availableQuestions.length]
          return questions.indexOf(currentQuestion)
        })()
    
    if (originalIndex === -1) return
    
    if (isCorrect) {
      // Сохраняем правильный ответ
      setAnswers(prev => {
        const newAnswers = new Map(prev)
        newAnswers.set(originalIndex, answer)
        return newAnswers
      })
      
      // Для guess-face НЕ добавляем в usedQuestions сразу - только при переходе на другой вопрос
      if (roundId !== 'guess-face') {
        const newUsed = [...usedQuestions, originalIndex]
        
        // Если все вопросы использованы, сбрасываем список
        if (newUsed.length >= questions.length) {
          setUsedQuestions([])
          localStorage.removeItem(`used-${roundId}`)
        } else {
          setUsedQuestions(newUsed)
          localStorage.setItem(`used-${roundId}`, JSON.stringify(newUsed))
        }
      }
    } else {
      // Сохраняем неправильный ответ (добавляем в массив)
      setWrongAnswers(prev => {
        const newWrongAnswers = new Map(prev)
        const currentWrong = newWrongAnswers.get(originalIndex) || []
        if (!currentWrong.includes(answer)) {
          newWrongAnswers.set(originalIndex, [...currentWrong, answer])
        }
        return newWrongAnswers
      })
    }
  }

  const handleNext = () => {
    if (questions.length === 0) return
    
    if (roundId === 'guess-face') {
      // Для guess-face циклическая навигация по всем вопросам
      const nextIndex = (currentIndex + 1) % questions.length
      setCurrentIndex(nextIndex)
      onQuestionComplete(nextIndex)
    } else {
      if (availableQuestions.length === 0) return
      const nextIndex = (currentIndex + 1) % availableQuestions.length
      setCurrentIndex(nextIndex)
      onQuestionComplete(nextIndex)
    }
  }

  const handlePrevious = () => {
    if (questions.length === 0) return
    
    if (roundId === 'guess-face') {
      // Для guess-face циклическая навигация по всем вопросам
      const prevIndex = currentIndex === 0 ? questions.length - 1 : currentIndex - 1
      setCurrentIndex(prevIndex)
      onQuestionComplete(prevIndex)
    } else {
      if (availableQuestions.length === 0) return
      const prevIndex = currentIndex === 0 ? availableQuestions.length - 1 : currentIndex - 1
      setCurrentIndex(prevIndex)
      onQuestionComplete(prevIndex)
    }
  }

  const currentQuestion =
    questions.length > 0
      ? questions[currentIndex % questions.length]
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
    // Получаем сохраненные ответы для текущего вопроса
    const currentQuestionIndex = questions.indexOf(currentQuestion)
    const savedAnswer = currentQuestionIndex !== -1 ? answers.get(currentQuestionIndex) : null
    const savedWrongAnswers = currentQuestionIndex !== -1 ? wrongAnswers.get(currentQuestionIndex) || [] : []
    
    // Всегда показываем обе стрелки, если вопросов больше одного (циклическая навигация)
    // Используем questions.length, так как availableQuestions может быть пустым на момент первого рендера
    const showArrows = questions.length > 1

    switch (roundId) {
      case 'guess-face':
        return (
          <GuessFaceGame
            question={currentQuestion}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={showArrows}
            canGoPrevious={showArrows}
            savedAnswer={savedAnswer}
            savedWrongAnswers={savedWrongAnswers}
          />
        )
      case 'guess-melody':
        return (
          <GuessMelodyGame
            question={currentQuestion}
            onAnswer={(isCorrect) => handleAnswer('', isCorrect)}
          />
        )
      case 'bible-quotes':
        return (
          <BibleQuotesGame
            question={currentQuestion}
            onAnswer={(isCorrect) => handleAnswer('', isCorrect)}
          />
        )
      case 'guess-voice':
        return (
          <GuessVoiceGame
            question={currentQuestion}
            onAnswer={(isCorrect) => handleAnswer('', isCorrect)}
          />
        )
      case 'calendar':
        return (
          <CalendarGame
            question={currentQuestion}
            onAnswer={(isCorrect) => handleAnswer('', isCorrect)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-[600px] md:min-h-[800px] flex flex-col items-center justify-center px-4 py-6 md:py-8 relative">
      <div className="absolute top-4 left-4 z-20">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg transition-all backdrop-blur-md text-sm md:text-base"
        >
          ← Назад
        </motion.button>
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

