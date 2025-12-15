'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface CalendarGameProps {
  question: any
  onAnswer: (isCorrect: boolean) => void
}

export default function CalendarGame({ question, onAnswer }: CalendarGameProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleSelect = (answer: string) => {
    if (showResult) return
    setSelectedAnswer(answer)
    const isCorrect = answer === question.correctAnswer
    setShowResult(true)
    
    setTimeout(() => {
      onAnswer(isCorrect)
      setSelectedAnswer(null)
      setShowResult(false)
    }, 2000)
  }

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(22, 163, 74, 0.15) 50%, rgba(234, 179, 8, 0.15) 100%)',
        border: '3px solid rgba(234, 179, 8, 0.5)',
        boxShadow: '0 8px 32px rgba(234, 179, 8, 0.3)',
      }}
      className="backdrop-blur-md rounded-3xl p-4 md:p-6 lg:p-8"
    >
      <h2 
        style={{
          background: 'linear-gradient(90deg, #dc2626 0%, #16a34a 50%, #eab308 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 text-center"
      >
        📅 {question.questionType === 'date' ? 'Угадай дату' : 'Угадай день рождения'} 🎄
      </h2>

      {question.questionType === 'date' && question.image && (
        <div className="mb-4 md:mb-6 flex justify-center">
          <div 
            style={{
              border: '3px solid rgba(234, 179, 8, 0.6)',
              boxShadow: '0 0 30px rgba(234, 179, 8, 0.4)',
            }}
            className="relative w-full max-w-sm md:max-w-md lg:max-w-lg aspect-square bg-white/20 rounded-2xl overflow-hidden backdrop-blur-md"
          >
            <Image
              src={question.image}
              alt="Фото"
              width={400}
              height={400}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        </div>
      )}

      {question.questionType === 'birthday' && question.date && (
        <div className="mb-4 md:mb-6">
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(22, 163, 74, 0.2) 50%, rgba(234, 179, 8, 0.2) 100%)',
              border: '2px solid rgba(234, 179, 8, 0.5)',
              boxShadow: '0 4px 20px rgba(234, 179, 8, 0.3)',
            }}
            className="rounded-2xl p-4 md:p-6 mb-4 backdrop-blur-md"
          >
            <p className="text-xl md:text-2xl lg:text-3xl text-white text-center font-bold">
              {question.date}
            </p>
          </div>
          <p className="text-white/80 text-center text-base md:text-lg">
            У кого день рождения в эту дату?
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {question.options.map((option: string) => {
          const isSelected = showResult && selectedAnswer === option
          const shouldShowGreen = isSelected && option === question.correctAnswer
          const shouldShowRed = isSelected && option !== question.correctAnswer
          const shouldShowCorrect = showResult && option === question.correctAnswer
          
          return (
            <motion.button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={showResult}
              whileHover={{ scale: showResult ? 1 : 1.05 }}
              whileTap={{ scale: showResult ? 1 : 0.95 }}
              initial={false}
              style={{
                background: shouldShowGreen || shouldShowCorrect
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : shouldShowRed
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(22, 163, 74, 0.3) 50%, rgba(234, 179, 8, 0.3) 100%)',
                boxShadow: shouldShowGreen || shouldShowCorrect
                  ? '0 4px 20px rgba(34, 197, 94, 0.4)'
                  : shouldShowRed
                  ? '0 4px 20px rgba(239, 68, 68, 0.4)'
                  : '0 4px 15px rgba(234, 179, 8, 0.3)',
                border: shouldShowGreen || shouldShowCorrect
                  ? '2px solid #22c55e'
                  : shouldShowRed
                  ? '2px solid #ef4444'
                  : '2px solid rgba(234, 179, 8, 0.5)',
              }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
              }}
              className="p-3 md:p-4 rounded-xl text-base md:text-lg font-bold text-white backdrop-blur-md relative overflow-hidden shadow-lg"
            >
              {option}
            </motion.button>
          )
        })}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 md:mt-6 text-center"
        >
          <p className={`text-xl md:text-2xl font-bold ${
            selectedAnswer === question.correctAnswer ? 'text-green-400' : 'text-red-400'
          }`}>
            {selectedAnswer === question.correctAnswer ? '✓ Правильно!' : '✗ Неправильно'}
          </p>
        </motion.div>
      )}
    </div>
  )
}
