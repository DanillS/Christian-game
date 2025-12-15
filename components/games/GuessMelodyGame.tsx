'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface GuessMelodyGameProps {
  question: any
  onAnswer: (isCorrect: boolean) => void
  onNext?: () => void
  onPrevious?: () => void
  canGoNext?: boolean
  canGoPrevious?: boolean
}

export default function GuessMelodyGame({ 
  question, 
  onAnswer,
  onNext,
  onPrevious,
  canGoNext = false,
  canGoPrevious = false
}: GuessMelodyGameProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const isPlayingRef = useRef(false)

  // Сброс состояния и обновление аудио при смене вопроса
  useEffect(() => {
    if (!question?.audioUrl) return
    
    console.log('[GuessMelodyGame] Смена вопроса, новый audioUrl:', question.audioUrl)
    
    // Сбрасываем состояние воспроизведения
    isPlayingRef.current = false
    setIsPlaying(false)
    setSelectedAnswer(null)
    setShowResult(false)
    
    // Обновляем src аудио элемента
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.src = question.audioUrl
      audioRef.current.load()
      console.log('[GuessMelodyGame] Аудио обновлено:', audioRef.current.src)
    }
  }, [question?.audioUrl])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      isPlayingRef.current = false
      setIsPlaying(false)
    }
  }, [])

  const handlePlay = async () => {
    if (!audioRef.current || isPlayingRef.current) return
    
    try {
      isPlayingRef.current = true
      // Проверяем готовность аудио
      if (audioRef.current.readyState >= 2) {
        await audioRef.current.play()
        setIsPlaying(true)
      } else {
        // Ждем загрузки
        audioRef.current.addEventListener('canplay', async () => {
          try {
            await audioRef.current?.play()
            setIsPlaying(true)
          } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
              console.error('Ошибка воспроизведения аудио:', err)
            }
            isPlayingRef.current = false
            setIsPlaying(false)
          }
        }, { once: true })
      }
    } catch (error) {
      // Игнорируем AbortError - это не критическая ошибка
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Ошибка воспроизведения аудио:', error)
      }
      isPlayingRef.current = false
      setIsPlaying(false)
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      isPlayingRef.current = false
      setIsPlaying(false)
    }
  }

  const handleSelect = (answer: string) => {
    if (showResult) return
    setSelectedAnswer(answer)
    const isCorrect = answer === question.correctAnswer
    setShowResult(true)
    handlePause()
    
    setTimeout(() => {
      onAnswer(isCorrect)
      setSelectedAnswer(null)
      setShowResult(false)
      if (audioRef.current) {
        audioRef.current.currentTime = 0
      }
    }, 2000)
  }

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(22, 163, 74, 0.15) 50%, rgba(234, 179, 8, 0.15) 100%)',
        border: '3px solid rgba(234, 179, 8, 0.5)',
        boxShadow: '0 8px 32px rgba(234, 179, 8, 0.3)',
      }}
      className="backdrop-blur-md rounded-3xl p-6 md:p-8"
    >
      <h2 
        style={{
          background: 'linear-gradient(90deg, #dc2626 0%, #16a34a 50%, #eab308 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        className="text-2xl md:text-3xl font-bold mb-6 text-center"
      >
        🎵 Угадай мелодию 🎄
      </h2>

      <div className="mb-6 flex justify-center items-center gap-2">
        {/* Левая стрелка */}
        {canGoPrevious && onPrevious ? (
          <motion.button
            onClick={onPrevious}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.4) 0%, rgba(234, 179, 8, 0.4) 100%)',
              border: '2px solid rgba(234, 179, 8, 0.5)',
              boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)',
            }}
            className="text-white p-3 rounded-full backdrop-blur-md"
            aria-label="Предыдущий"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        ) : (
          <div className="w-10 md:w-12" />
        )}

        <div className="flex flex-col items-center">
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(22, 163, 74, 0.3) 50%, rgba(234, 179, 8, 0.3) 100%)',
              border: '3px solid rgba(234, 179, 8, 0.6)',
              boxShadow: '0 0 30px rgba(234, 179, 8, 0.4)',
            }}
            className="w-32 h-32 rounded-full flex items-center justify-center mb-4 backdrop-blur-md"
          >
            <span className="text-6xl">🎵</span>
          </div>
          
          {question.audioUrl && (
          <>
            <audio
              key={question.audioUrl}
              ref={audioRef}
              src={question.audioUrl}
              preload="auto"
              crossOrigin="anonymous"
              onEnded={() => {
                isPlayingRef.current = false
                setIsPlaying(false)
              }}
              onError={(e) => {
                // Игнорируем ошибки загрузки для недоступных файлов (timeout, network errors)
                const target = e.target as HTMLAudioElement
                if (target.error) {
                  const errorCode = target.error.code
                  // Коды ошибок: 1=MEDIA_ERR_ABORTED, 2=MEDIA_ERR_NETWORK, 3=MEDIA_ERR_DECODE, 4=MEDIA_ERR_SRC_NOT_SUPPORTED
                  if (errorCode === 2 || errorCode === 4) {
                    // Сетевые ошибки или неподдерживаемый формат - просто игнорируем (не логируем как warning)
                    // console.warn('Аудиофайл недоступен:', question.audioUrl)
                  } else if (errorCode !== 1) {
                    // Игнорируем MEDIA_ERR_ABORTED (код 1) - это нормально при переключении
                    console.error('Ошибка загрузки аудио:', target.error)
                  }
                }
                isPlayingRef.current = false
                setIsPlaying(false)
              }}
              onAbort={() => {
                // Игнорируем прерывание - это нормально при быстрых переключениях
                isPlayingRef.current = false
                setIsPlaying(false)
              }}
              onLoadedMetadata={() => {
                // Аудио успешно загружено
                if (audioRef.current) {
                  audioRef.current.currentTime = 0
                }
              }}
            />
            <div className="flex gap-4">
              <motion.button
                onClick={isPlaying ? handlePause : handlePlay}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.4) 0%, rgba(22, 163, 74, 0.4) 100%)',
                  border: '2px solid rgba(234, 179, 8, 0.6)',
                  boxShadow: '0 4px 15px rgba(234, 179, 8, 0.3)',
                }}
                className="text-white px-6 py-3 rounded-xl text-lg font-bold backdrop-blur-md"
              >
                {isPlaying ? '⏸ Пауза' : '▶ Воспроизвести'}
              </motion.button>
            </div>
          </>
        )}

          {!question.audioUrl && (
            <p className="text-white/80 text-center">
              Аудиофайл не загружен. Добавьте файл в data/guessMelodyData.ts
            </p>
          )}
        </div>

        {/* Правая стрелка */}
        {canGoNext && onNext ? (
          <motion.button
            onClick={onNext}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.4) 0%, rgba(234, 179, 8, 0.4) 100%)',
              border: '2px solid rgba(234, 179, 8, 0.5)',
              boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)',
            }}
            className="text-white p-3 rounded-full backdrop-blur-md"
            aria-label="Следующий"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        ) : (
          <div className="w-10 md:w-12" />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option: string) => {
          const isSelected = showResult && selectedAnswer === option
          const shouldShowGreen = isSelected && option === question.correctAnswer
          const shouldShowRed = isSelected && option !== question.correctAnswer
          const shouldShowCorrect = showResult && option === question.correctAnswer
          
          return (
            <motion.button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={showResult}
              whileHover={{ scale: showResult ? 1 : 1.05 }}
              whileTap={{ scale: showResult ? 1 : 0.95 }}
              initial={false}
              style={{
                background: shouldShowGreen || shouldShowCorrect
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : shouldShowRed
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(22, 163, 74, 0.3) 50%, rgba(234, 179, 8, 0.3) 100%)',
                boxShadow: shouldShowGreen || shouldShowCorrect
                  ? '0 4px 20px rgba(34, 197, 94, 0.4)'
                  : shouldShowRed
                  ? '0 4px 20px rgba(239, 68, 68, 0.4)'
                  : '0 4px 15px rgba(234, 179, 8, 0.3)',
                border: shouldShowGreen || shouldShowCorrect
                  ? '2px solid #22c55e'
                  : shouldShowRed
                  ? '2px solid #ef4444'
                  : '2px solid rgba(234, 179, 8, 0.5)',
              }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
              }}
              className="p-4 rounded-xl text-lg font-bold text-white backdrop-blur-md relative overflow-hidden shadow-lg"
            >
              {option}
            </motion.button>
          )
        })}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p className={`text-2xl font-bold ${
            selectedAnswer === question.correctAnswer ? 'text-green-400' : 'text-red-400'
          }`}>
            {selectedAnswer === question.correctAnswer ? '✓ Правильно!' : '✗ Неправильно'}
          </p>
        </motion.div>
      )}
    </div>
  )
}
