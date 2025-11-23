'use client'

import RoundSelector from '@/components/RoundSelector'
import SnowAnimation from '@/components/SnowAnimation'
import StarsBackground from '@/components/StarsBackground'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 relative overflow-hidden">
      <StarsBackground />
      <SnowAnimation />
      <RoundSelector />
    </div>
  )
}

