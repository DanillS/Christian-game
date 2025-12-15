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
    <div 
      style={{
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(22, 163, 74, 0.15) 50%, rgba(234, 179, 8, 0.15) 100%)',
        border: '3px solid rgba(234, 179, 8, 0.5)',
        boxShadow: '0 8px 32px rgba(234, 179, 8, 0.3)',
      }}
      className="backdrop-blur-md rounded-3xl p-6 md:p-8"
    >
      <h2 
        style={{
          background: 'linear-gradient(90deg, #dc2626 0%, #16a34a 50%, #eab308 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        className="text-2xl md:text-3xl font-bold mb-6 text-center"
      >
        👤 Угадай по фрагментам 🎄
      </h2>

      <div className="mb-6 flex justify-center items-center gap-2">
        {/* Левая стрелка */}
        {canGoPrevious && onPrevious ? (
          <motion.button
            onClick={onPrevious}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.4) 0%, rgba(234, 179, 8, 0.4) 100%)',
              border: '2px solid rgba(234, 179, 8, 0.5)',
              boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)',
            }}
            className="text-white p-3 rounded-full backdrop-blur-md"
            aria-label="Предыдущий"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        ) : (
          <div className="w-10 md:w-12" />
        )}

        {/* Изображение */}
        <div 
          style={{
            border: '3px solid rgba(234, 179, 8, 0.6)',
            boxShadow: '0 0 30px rgba(234, 179, 8, 0.4)',
          }}
          className="relative w-64 h-64 md:w-80 md:h-80 bg-white/20 rounded-2xl overflow-hidden backdrop-blur-md"
        >
          <Image
            src={imageToShow}
            alt={isCorrect ? "Полная фотография" : "Часть тела"}
            width={320}
            height={320}
            className="object-cover w-full h-full"
            unoptimized
          />
        </div>

        {/* Правая стрелка */}
        {canGoNext && onNext ? (
          <motion.button
            onClick={onNext}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.4) 0%, rgba(234, 179, 8, 0.4) 100%)',
              border: '2px solid rgba(234, 179, 8, 0.5)',
              boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)',
            }}
            className="text-white p-3 rounded-full backdrop-blur-md"
            aria-label="Следующий"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
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
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              style={{
                background: isSelectedCorrect
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : isWrongAnswer
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(22, 163, 74, 0.3) 50%, rgba(234, 179, 8, 0.3) 100%)',
                boxShadow: isSelectedCorrect
                  ? '0 4px 20px rgba(34, 197, 94, 0.4)'
                  : isWrongAnswer
                  ? '0 4px 20px rgba(239, 68, 68, 0.4)'
                  : '0 4px 15px rgba(234, 179, 8, 0.3)',
                border: isSelectedCorrect
                  ? '2px solid #22c55e'
                  : isWrongAnswer
                  ? '2px solid #ef4444'
                  : '2px solid rgba(234, 179, 8, 0.5)',
                opacity: isDisabled && !isSelectedCorrect ? 0.5 : 1,
              }}
              className="p-4 rounded-xl text-lg font-bold text-white backdrop-blur-md relative overflow-hidden shadow-lg"
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
