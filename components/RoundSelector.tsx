'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

const rounds = [
  {
    id: 'guess-face',
    name: 'Угадай Лицо',
    description: 'Угадай по фрагментам',
    icon: '/icons/guess-face.png',
  },
  {
    id: 'guess-melody',
    name: 'Угадай Мелодию',
    description: 'Узнай христианские гимны',
    icon: '/icons/guess-melody.png',
  },
  {
    id: 'bible-quotes',
    name: 'Библейские Цитаты',
    description: 'Продолжи цитату',
    icon: '/icons/bible-quotes.png',
  },
  {
    id: 'guess-voice',
    name: 'Угадай, Кто Говорит',
    description: 'Узнай голос',
    icon: '/icons/guess-voice.png',
  },
  {
    id: 'calendar',
    name: 'Календарь',
    description: 'Угадай дату или день рождения',
    icon: '/icons/calendar.png',
  },
]

export default function RoundSelector() {
  const router = useRouter()
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  return (
    <div className="min-h-[600px] md:min-h-[800px] flex flex-col items-center justify-center px-4 py-6 md:py-8 relative z-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6 text-center drop-shadow-lg"
      >
        Рождественские Тайны
      </motion.h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full">
        {rounds.map((round, index) => (
          <motion.div
            key={round.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-6 cursor-pointer border-2 border-yellow-400/30 hover:border-yellow-400/70 transition-all"
            onClick={() => router.push(`/round/${round.id}`)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-white/20 rounded-full flex items-center justify-center mb-2 md:mb-4 relative overflow-hidden">
                {imageErrors[round.id] ? (
                  <span className="text-4xl">🎄</span>
                ) : (
                  <Image
                    src={round.icon}
                    alt={round.name}
                    width={80}
                    height={80}
                    className="object-contain"
                    unoptimized
                    onError={() => {
                      setImageErrors((prev) => ({ ...prev, [round.id]: true }))
                    }}
                  />
                )}
              </div>
              <h2 className="text-sm md:text-xl lg:text-2xl font-bold text-white mb-1 md:mb-2">
                {round.name}
              </h2>
              <p className="text-white/80 text-xs md:text-sm">
                {round.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

