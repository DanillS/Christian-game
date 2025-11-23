'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import DifficultySelector from '@/components/DifficultySelector'
import RoundGame from '@/components/RoundGame'
import SnowAnimation from '@/components/SnowAnimation'
import StarsBackground from '@/components/StarsBackground'

export default function RoundPage() {
  const params = useParams()
  const router = useRouter()
  const roundId = params.roundId as string
  const [difficulty, setDifficulty] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  useEffect(() => {
    // Загружаем сохраненный прогресс
    const saved = localStorage.getItem(`progress-${roundId}`)
    if (saved) {
      const progress = JSON.parse(saved)
      setDifficulty(progress.difficulty)
      setCurrentQuestionIndex(progress.questionIndex)
    }
  }, [roundId])

  const handleDifficultySelect = (selectedDifficulty: string) => {
    setDifficulty(selectedDifficulty)
    // Сбрасываем прогресс при выборе нового уровня
    const saved = localStorage.getItem(`progress-${roundId}-${selectedDifficulty}`)
    if (saved) {
      const progress = JSON.parse(saved)
      setCurrentQuestionIndex(progress.questionIndex)
    } else {
      setCurrentQuestionIndex(0)
    }
  }

  const handleBack = () => {
    setDifficulty(null)
  }

  const handleQuestionComplete = (newIndex: number) => {
    setCurrentQuestionIndex(newIndex)
    // Сохраняем прогресс
    if (difficulty) {
      localStorage.setItem(
        `progress-${roundId}-${difficulty}`,
        JSON.stringify({ questionIndex: newIndex })
      )
      localStorage.setItem(
        `progress-${roundId}`,
        JSON.stringify({ difficulty, questionIndex: newIndex })
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 relative overflow-hidden">
      <StarsBackground />
      <SnowAnimation />
      <div className="relative z-10 min-h-screen">
        {!difficulty ? (
          <DifficultySelector
            roundId={roundId}
            onSelect={handleDifficultySelect}
            onBack={() => router.push('/')}
          />
        ) : (
          <RoundGame
            roundId={roundId}
            difficulty={difficulty}
            initialQuestionIndex={currentQuestionIndex}
            onBack={handleBack}
            onQuestionComplete={handleQuestionComplete}
          />
        )}
      </div>
    </div>
  )
}

