'use client'

import { useState, useEffect } from 'react'

export default function SystemStatusBar() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      setTime(`${hours}:${minutes}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      className="absolute top-0 left-0 right-0 h-12 md:h-14 flex items-center justify-end px-4 md:px-6 z-30 pointer-events-none"
      style={{
        background: 'transparent',
      }}
    >
      <div 
        className="flex items-center gap-2"
        style={{
          marginLeft: '12px',
          marginRight: '12px',
        }}
      >
        {/* Батарея (опционально) */}
        <div className="hidden md:flex items-center gap-1">
          <div className="w-6 h-3 border border-white/60 rounded-sm">
            <div 
              className="h-full w-4/5 bg-white/80 rounded-sm"
              style={{ margin: '1px' }}
            />
          </div>
        </div>
        
        {/* Время */}
        <span 
          className="text-white font-semibold text-sm md:text-base"
          style={{
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        >
          {time}
        </span>
      </div>
    </div>
  )
}
