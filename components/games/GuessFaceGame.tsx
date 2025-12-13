'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface GuessFaceGameProps {
  question: any
  onAnswer: (answer: string, isCorrect: boolean) => void
  onNext?: () => void
  onPrevious?: () => void
  canGoNext?: boolean
  canGoPrevious?: boolean
  savedAnswer?: string | null
  savedWrongAnswers?: string[]
}

export default function GuessFaceGame({ 
  question, 
  onAnswer,
  onNext,
  onPrevious,
  canGoNext = true,
  canGoPrevious = true,
  savedAnswer = null,
  savedWrongAnswers = []
}: GuessFaceGameProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(savedAnswer || null)
  const [wrongAnswers, setWrongAnswers] = useState<string[]>(savedWrongAnswers || [])
  
  // При смене вопроса сбрасываем состояние
  useEffect(() => {
    setSelectedAnswer(savedAnswer || null)
    setWrongAnswers(savedWrongAnswers || [])
  }, [question?.image])

  const handleSelect = (answer: string) => {
    // Если уже правильно ответили - ничего не делаем
    if (selectedAnswer === question.correctAnswer) {
      return
    }

    const isCorrect = answer === question.correctAnswer
    
    if (isCorrect) {
      setSelectedAnswer(answer)
      onAnswer(answer, true)
    } else {
      if (!wrongAnswers.includes(answer)) {
        setWrongAnswers(prev => [...prev, answer])
      }
      onAnswer(answer, false)
    }
  }

  // Показываем полную фотографию только если правильно ответили
  const isCorrect = selectedAnswer === question.correctAnswer
  const imageToShow = isCorrect && question.fullImage ? question.fullImage : question.image

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border-2 border-yellow-400/30">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
        Угадай по фрагментам
      </h2>

      <div className="mb-6 flex justify-center items-center gap-2">
        {/* Левая стрелка */}
        {canGoPrevious && onPrevious ? (
          <motion.button
            onClick={onPrevious}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all backdrop-blur-md"
            aria-label="Предыдущий"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        ) : (
          <div className="w-10 md:w-12" />
        )}

        {/* Изображение */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white/20 rounded-lg overflow-hidden">
          <Image
            src={imageToShow}
            alt={isCorrect ? "Полная фотография" : "Часть тела"}
            width={320}
            height={320}
            className="object-cover w-full h-full"
            unoptimized
            key={question?.image}
          />
        </div>

        {/* Правая стрелка */}
        {canGoNext && onNext ? (
          <motion.button
            onClick={onNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all backdrop-blur-md"
            aria-label="Следующий"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        ) : (
          <div className="w-10 md:w-12" />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option: string) => {
          const isSelectedCorrect = isCorrect && selectedAnswer === option
          const isWrongAnswer = wrongAnswers.includes(option)
          const isDisabled = isCorrect
          
          return (
            <motion.button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              className={`p-4 rounded-lg text-lg font-semibold transition-all ${
                isSelectedCorrect
                  ? 'bg-green-500 text-white'
                  : isWrongAnswer
                  ? 'bg-red-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              } ${isDisabled && !isSelectedCorrect ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {option}
            </motion.button>
          )
        })}
      </div>

      {/* Сообщение о результате */}
      {(isCorrect || wrongAnswers.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p className={`text-2xl font-bold ${
            isCorrect ? 'text-green-400' : 'text-red-400'
          }`}>
            {isCorrect ? '✓ Правильно!' : '✗ Неправильно!'}
          </p>
        </motion.div>
      )}
    </div>
  )
}
