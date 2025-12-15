'use client'

import { motion } from 'framer-motion'

interface PowerButtonProps {
  isOn: boolean
  onToggle: () => void
}

export default function PowerButton({ isOn, onToggle }: PowerButtonProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-40 w-8 h-16 md:w-10 md:h-20 rounded-full flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        willChange: 'transform',
      }}
      aria-label={isOn ? 'Выключить' : 'Включить'}
    >
      <div 
        className="w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300"
        style={{
          background: isOn ? '#34c759' : '#8e8e93',
          boxShadow: isOn 
            ? '0 0 8px rgba(52, 199, 89, 0.6)' 
            : '0 0 4px rgba(142, 142, 147, 0.4)',
        }}
      />
    </motion.button>
  )
}
