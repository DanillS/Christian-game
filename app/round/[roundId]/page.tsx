'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import RoundGame from '@/components/RoundGame'
import SnowAnimation from '@/components/SnowAnimation'
import StarsBackground from '@/components/StarsBackground'
import DifficultySelector from '@/components/DifficultySelector'

export default function RoundPage() {
  const params = useParams()
  const router = useRouter()
  const roundId = params.roundId as string
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  useEffect(() => {
    if (!selectedDifficulty) return
    const saved = localStorage.getItem(`progress-${roundId}-${selectedDifficulty}`)
    if (saved) {
      const progress = JSON.parse(saved)
      setCurrentQuestionIndex(progress.questionIndex || 0)
    } else {
      setCurrentQuestionIndex(0)
    }
  }, [roundId, selectedDifficulty])

  const handleQuestionComplete = (newIndex: number) => {
    if (!selectedDifficulty) return
    setCurrentQuestionIndex(newIndex)
    localStorage.setItem(
      `progress-${roundId}-${selectedDifficulty}`,
      JSON.stringify({ questionIndex: newIndex })
    )
  }

  const handleDifficultySelect = (difficulty: string) => {
    setSelectedDifficulty(difficulty)
  }

  const handleReturnToSelector = () => {
    setSelectedDifficulty(null)
  }

  const handleExit = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 relative overflow-hidden flex items-center justify-center p-4">
      <StarsBackground />
      <SnowAnimation />
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl">
        <div className="bg-gray-900 rounded-[2.5rem] md:rounded-[3rem] p-4 md:p-6 shadow-2xl border-4 border-gray-800">
          <div className="bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden min-h-[600px] flex items-center justify-center">
            {selectedDifficulty ? (
              <RoundGame
                roundId={roundId}
                difficulty={selectedDifficulty}
                initialQuestionIndex={currentQuestionIndex}
                onBack={handleReturnToSelector}
                onQuestionComplete={handleQuestionComplete}
              />
            ) : (
              <DifficultySelector
                roundId={roundId}
                onSelect={handleDifficultySelect}
                onBack={handleExit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

