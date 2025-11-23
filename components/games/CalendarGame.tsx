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
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 lg:p-8 border-2 border-yellow-400/30">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4 md:mb-6 text-center">
        {question.questionType === 'date' ? 'Угадай дату' : 'Угадай день рождения'}
      </h2>

      {question.questionType === 'date' && question.image && (
        <div className="mb-4 md:mb-6 flex justify-center">
          <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg aspect-square bg-white/20 rounded-lg overflow-hidden">
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
          <div className="bg-white/20 rounded-lg p-4 md:p-6 mb-4">
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
        {question.options.map((option: string) => (
          <motion.button
            key={option}
            onClick={() => handleSelect(option)}
            disabled={showResult}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 md:p-4 rounded-lg text-base md:text-lg font-semibold transition-all ${
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

