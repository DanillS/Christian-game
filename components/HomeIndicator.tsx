'use client'

export default function HomeIndicator() {
  return (
    <div 
      className="absolute bottom-2 md:bottom-3 left-1/2 transform -translate-x-1/2 w-36 md:w-48 lg:w-56 h-1.5 md:h-2 lg:h-2.5 rounded-full z-30 pointer-events-none"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
      }}
    />
  )
}
