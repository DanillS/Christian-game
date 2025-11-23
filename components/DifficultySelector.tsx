'use client'

import { motion } from 'framer-motion'

const difficulties = [
  { id: 'easy', name: 'Легко', emoji: '😊' },
  { id: 'medium', name: 'Средне', emoji: '🤔' },
  { id: 'hard', name: 'Тяжело', emoji: '😤' },
]

const roundNames: Record<string, string> = {
  'guess-face': 'Угадай Лицо',
  'guess-melody': 'Угадай Мелодию',
  'bible-quotes': 'Библейские Цитаты',
  'guess-voice': 'Угадай, Кто Говорит',
}

interface DifficultySelectorProps {
  roundId: string
  onSelect: (difficulty: string) => void
  onBack: () => void
}

export default function DifficultySelector({ roundId, onSelect, onBack }: DifficultySelectorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onBack}
        className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all backdrop-blur-md"
      >
        ← Назад
      </motion.button>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-bold text-white mb-8 text-center drop-shadow-lg"
      >
        {roundNames[roundId] || 'Раунд'}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl text-white/80 mb-12 text-center"
      >
        Выберите уровень сложности
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
        {difficulties.map((difficulty, index) => (
          <motion.button
            key={difficulty.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(difficulty.id)}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/30 hover:border-yellow-400/70 transition-all cursor-pointer"
          >
            <div className="text-6xl mb-4">{difficulty.emoji}</div>
            <div className="text-2xl font-bold text-white">{difficulty.name}</div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

