'use client'

import { motion } from 'framer-motion'

export default function WelcomeScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="text-center px-4"
    >
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
      >
        Приветствую вас, можгарики!
      </motion.h1>
      <motion.p
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="text-2xl md:text-4xl text-yellow-400 font-semibold drop-shadow-lg"
      >
        Поздравляю с Рождеством Христовым!!!
      </motion.p>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-8 text-6xl"
      >
        ⭐
      </motion.div>
    </motion.div>
  )
}

