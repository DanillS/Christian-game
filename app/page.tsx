'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import RoundSelector from '@/components/RoundSelector'
import SnowAnimation from '@/components/SnowAnimation'
import StarsBackground from '@/components/StarsBackground'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = localStorage.getItem('authenticated')
      if (authenticated === 'true') {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.push('/login')
      }
    }

    checkAuth()
    
    // Проверяем при изменении localStorage (например, при входе в другой вкладке)
    const handleStorageChange = () => {
      checkAuth()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [router])

  // Показываем загрузку, пока проверяем аутентификацию
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 relative overflow-hidden flex items-center justify-center">
        <StarsBackground />
        <SnowAnimation />
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    )
  }

  // Если не авторизован, показываем ничего (редирект на /login)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 relative overflow-hidden flex items-center justify-center p-4">
      <StarsBackground />
      <SnowAnimation />
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl">
        <div className="bg-gray-900 rounded-[2.5rem] md:rounded-[3rem] p-4 md:p-6 shadow-2xl border-4 border-gray-800">
          <div className="bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
            <RoundSelector />
          </div>
        </div>
      </div>
    </div>
  )
}

