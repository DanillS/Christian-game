'use client'

import { motion } from 'framer-motion'

export default function WelcomeScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="text-center px-4"
    >
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          delay: 0.2,
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl"
      >
        Приветствую вас, можгарики!
      </motion.h1>
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.4,
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="relative inline-block"
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 20px rgba(234, 179, 8, 0.4)',
              '0 0 40px rgba(234, 179, 8, 0.6)',
              '0 0 20px rgba(234, 179, 8, 0.4)',
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="rounded-3xl p-6 md:p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(234, 179, 8, 0.5)',
          }}
        >
          <p className="text-2xl md:text-4xl lg:text-5xl text-yellow-400 font-bold drop-shadow-lg">
            Поздравляю с Рождеством Христовым!!!
          </p>
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
        }}
        transition={{ 
          delay: 0.6,
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="mt-10"
      >
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-7xl md:text-8xl inline-block"
        >
          ⭐
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
