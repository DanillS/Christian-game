'use client'

import { useState, useEffect } from 'react'

export default function SnowAnimation() {
  const [snowflakes, setSnowflakes] = useState<Array<{ left: number; delay: number; duration: number; opacity: number }>>([])

  useEffect(() => {
    // Генерируем снежинки только на клиенте
    const flakes = Array.from({ length: 50 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 20,
      duration: 15 + Math.random() * 10,
      opacity: 0.7 + Math.random() * 0.3,
    }))
    setSnowflakes(flakes)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {snowflakes.map((flake, i) => (
        <div
          key={i}
          className="absolute text-white text-2xl animate-snow"
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            opacity: flake.opacity,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  )
}

