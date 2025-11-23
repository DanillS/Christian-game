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
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border-2 border-yellow-400/30">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
        Библейские Цитаты
      </h2>

      <div className="mb-8">
        <div className="bg-white/20 rounded-lg p-6 mb-4">
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

