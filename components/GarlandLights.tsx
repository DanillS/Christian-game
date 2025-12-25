'use client'

import { useEffect, useState } from 'react'

export default function GarlandLights() {
  const [lights, setLights] = useState<Array<{ left: number; top: number; delay: number }>>([])

  useEffect(() => {
    // Генерируем огоньки только на клиенте для оптимизации
    // Размещаем их по периметру рамки устройства
    const lightsData: Array<{ left: number; top: number; delay: number }> = []
    
    // Верхняя часть
    for (let i = 0; i < 12; i++) {
      lightsData.push({
        left: (i * 8.33) + 2,
        top: 2,
        delay: Math.random() * 2,
      })
    }
    
    // Боковые части (меньше огоньков для производительности)
    for (let i = 0; i < 8; i++) {
      lightsData.push({
        left: 2,
        top: 10 + (i * 10),
        delay: Math.random() * 2,
      })
      lightsData.push({
        left: 98,
        top: 10 + (i * 10),
        delay: Math.random() * 2,
      })
    }
    
    // Нижняя часть
    for (let i = 0; i < 12; i++) {
      lightsData.push({
        left: (i * 8.33) + 2,
        top: 98,
        delay: Math.random() * 2,
      })
    }
    
    setLights(lightsData)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem]">
      {lights.map((light, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-twinkle-lights"
          style={{
            left: `${light.left}%`,
            top: `${light.top}%`,
            animationDelay: `${light.delay}s`,
            background: `radial-gradient(circle, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.6) 50%, transparent 100%)`,
            boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
            willChange: 'opacity, transform',
          }}
        />
      ))}
    </div>
  )
}









