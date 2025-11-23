'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import WelcomeScreen from '@/components/WelcomeScreen'
import RoundSelector from '@/components/RoundSelector'
import SnowAnimation from '@/components/SnowAnimation'
import StarsBackground from '@/components/StarsBackground'

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 flex items-center justify-center relative overflow-hidden">
        <StarsBackground />
        <SnowAnimation />
        <WelcomeScreen />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 relative overflow-hidden">
      <StarsBackground />
      <SnowAnimation />
      <RoundSelector />
    </div>
  )
}

