'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface GuessFaceGameProps {
  question: any
  onAnswer: (isCorrect: boolean) => void
}

export default function GuessFaceGame({ question, onAnswer }: GuessFaceGameProps) {
  const [revealedParts, setRevealedParts] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const parts = question.parts || ['nose', 'eyes', 'mouth', 'hands', 'full']

  const revealNextPart = () => {
    if (revealedParts.length < parts.length) {
      setRevealedParts([...revealedParts, parts[revealedParts.length]])
    }
  }

  const handleSelect = (answer: string) => {
    if (showResult) return
    setSelectedAnswer(answer)
    const isCorrect = answer === question.correctAnswer
    setShowResult(true)
    
    setTimeout(() => {
      onAnswer(isCorrect)
      setRevealedParts([])
      setSelectedAnswer(null)
      setShowResult(false)
    }, 2000)
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border-2 border-yellow-400/30">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
        Угадай по фрагментам
      </h2>

      <div className="mb-6 flex justify-center">
        <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white/20 rounded-lg overflow-hidden">
          {revealedParts.length > 0 ? (
            <Image
              src={question.image}
              alt="Фрагмент"
              width={320}
              height={320}
              className="object-cover w-full h-full"
              unoptimized
              style={{
                clipPath: revealedParts.includes('full') 
                  ? 'none' 
                  : `polygon(${revealedParts.map((_, i) => {
                      const positions: Record<string, string> = {
                        nose: '50% 50%, 45% 45%, 55% 45%',
                        eyes: '30% 30%, 70% 30%, 70% 40%, 30% 40%',
                        mouth: '40% 60%, 60% 60%, 60% 70%, 40% 70%',
                        hands: '0% 0%, 100% 0%, 100% 100%, 0% 100%',
                      }
                      return positions[parts[i]] || '50% 50%'
                    }).join(', ')})`
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              Нажмите "Показать фрагмент"
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {parts.map((part: string, index: number) => (
          <motion.button
            key={part}
            onClick={revealNextPart}
            disabled={revealedParts.includes(part) || showResult}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg ${
              revealedParts.includes(part)
                ? 'bg-green-500 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {index + 1}
          </motion.button>
        ))}
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
        </motion.div>
      )}
    </div>
  )
}

