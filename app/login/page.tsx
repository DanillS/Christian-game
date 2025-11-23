'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import SnowAnimation from '@/components/SnowAnimation'
import StarsBackground from '@/components/StarsBackground'

const PASSWORD = 'christmas2024' // Пароль можно изменить здесь

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === PASSWORD) {
      localStorage.setItem('authenticated', 'true')
      router.push('/')
    } else {
      setError('Неверный пароль')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 relative overflow-hidden flex items-center justify-center">
      <StarsBackground />
      <SnowAnimation />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border-2 border-yellow-400/30 max-w-md w-full mx-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">
          Рождественские Тайны
        </h1>
        <p className="text-white/80 text-center mb-8">Введите пароль для входа</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Пароль"
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border-2 border-white/30 focus:border-yellow-400/70 focus:outline-none transition-all"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}
          
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-yellow-400/80 hover:bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg transition-all"
          >
            Войти
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

