'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface BibleQuotesGameProps {
  question: any
  onAnswer: (isCorrect: boolean) => void
}

export default function BibleQuotesGame({ question, onAnswer }: BibleQuotesGameProps) {
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
        📖 Библейские Цитаты 🎄
      </h2>

      <div className="mb-8">
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(22, 163, 74, 0.2) 50%, rgba(234, 179, 8, 0.2) 100%)',
            border: '2px solid rgba(234, 179, 8, 0.5)',
            boxShadow: '0 4px 20px rgba(234, 179, 8, 0.3)',
          }}
          className="rounded-2xl p-6 mb-4 backdrop-blur-md"
        >
          <p className="text-xl md:text-2xl text-white text-center leading-relaxed">
            "{question.quote}"
          </p>
        </div>
        
        {question.questionType === 'source' && (
          <p className="text-white/80 text-center text-lg">
            Откуда эта цитата?
          </p>
        )}
        
        {question.questionType === 'continue' && (
          <p className="text-white/80 text-center text-lg">
            Продолжите цитату:
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="p-4 rounded-xl text-lg font-bold text-white backdrop-blur-md relative overflow-hidden shadow-lg"
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
          className="mt-6 text-center"
        >
          <p className={`text-2xl font-bold ${
            selectedAnswer === question.correctAnswer ? 'text-green-400' : 'text-red-400'
          }`}>
            {selectedAnswer === question.correctAnswer ? '✓ Правильно!' : '✗ Неправильно'}
          </p>
          {question.source && (
            <p className="text-white/80 mt-2">
              {question.source}
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}
