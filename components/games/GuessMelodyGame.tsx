"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface GuessMelodyGameProps {
  question: any;
  onAnswer: (isCorrect: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  onBack?: () => void;
}

export default function GuessMelodyGame({
  question,
  onAnswer,
  onNext,
  onPrevious,
  canGoNext = false,
  canGoPrevious = false,
  onBack,
}: GuessMelodyGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isPlayingRef = useRef(false);

  // Сброс состояния и обновление аудио при смене вопроса
  useEffect(() => {
    if (!question?.audioUrl) return;

    console.log(
      "[GuessMelodyGame] Смена вопроса, новый audioUrl:",
      question.audioUrl
    );

    // Сбрасываем состояние воспроизведения
    isPlayingRef.current = false;
    setIsPlaying(false);
    setSelectedAnswer(null);
    setShowResult(false);

    // Обновляем src аудио элемента
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = question.audioUrl;
      audioRef.current.load();
      console.log("[GuessMelodyGame] Аудио обновлено:", audioRef.current.src);
    }
  }, [question?.audioUrl]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      isPlayingRef.current = false;
      setIsPlaying(false);
    };
  }, []);

  const handlePlay = async () => {
    if (!audioRef.current || isPlayingRef.current) return;

    try {
      isPlayingRef.current = true;
      // Проверяем готовность аудио
      if (audioRef.current.readyState >= 2) {
        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        // Ждем загрузки
        audioRef.current.addEventListener(
          "canplay",
          async () => {
            try {
              await audioRef.current?.play();
              setIsPlaying(true);
            } catch (err) {
              if (err instanceof Error && err.name !== "AbortError") {
                console.error("Ошибка воспроизведения аудио:", err);
              }
              isPlayingRef.current = false;
              setIsPlaying(false);
            }
          },
          { once: true }
        );
      }
    } catch (error) {
      // Игнорируем AbortError - это не критическая ошибка
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Ошибка воспроизведения аудио:", error);
      }
      isPlayingRef.current = false;
      setIsPlaying(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      isPlayingRef.current = false;
      setIsPlaying(false);
    }
  };

  const handleSelect = (answer: string) => {
    if (showResult && selectedAnswer === question.correctAnswer) return; // Блокируем только если уже угадали правильно
    if (selectedAnswer !== null && selectedAnswer !== question.correctAnswer)
      return; // Блокируем, если идёт анимация

    setSelectedAnswer(answer);
    const isCorrect = answer === question.correctAnswer;
    setShowResult(true);
    handlePause();

    if (isCorrect) {
      // Правильный ответ
      onAnswer(true);
    } else {
      // Неправильный ответ - показываем анимацию и держим 2 секунды
      onAnswer(false);
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowResult(false);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      }, 2000);
    }
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1.5px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
      }}
      className="backdrop-blur-md rounded-xl p-4 md:p-5 h-full flex flex-col overflow-hidden relative"
    >
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
          whileHover={{
            scale: 1.05,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            color: "#000",
            transition: { duration: 0.2 },
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="absolute top-3 left-3 text-white p-2 md:px-3 md:py-2 rounded-lg font-semibold backdrop-blur-xl flex items-center gap-1.5 text-xs md:text-sm z-10"
          style={{
            background: "transparent",
            border: "1.5px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            willChange: "transform",
          }}
        >
          <svg
            className="w-5 h-5 md:w-4 md:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="hidden md:inline">Назад</span>
        </motion.button>
      )}

      <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-center text-white">
        🎵 Угадай мелодию 🎄
      </h2>

      <div className="mb-3 md:mb-4 flex justify-center items-center gap-4 md:gap-6 flex-shrink-0">
        {/* Левая стрелка */}
        {canGoPrevious && onPrevious ? (
          <motion.button
            onClick={onPrevious}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-white p-2 md:p-2.5 rounded-lg backdrop-blur-xl transition-all"
            style={{
              background: "transparent",
              border: "1.5px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
            whileHover={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#000",
            }}
            aria-label="Предыдущий"
          >
            <svg
              className="w-6 h-6 md:w-8 md:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>
        ) : (
          <div className="w-10 md:w-12" />
        )}

        <div className="flex flex-col items-center">
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "2px solid rgba(255, 255, 255, 0.9)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            }}
            className="w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center mb-2 md:mb-3 backdrop-blur-md"
          >
            <span className="text-6xl md:text-7xl">🎵</span>
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
                  isPlayingRef.current = false;
                  setIsPlaying(false);
                }}
                onError={(e) => {
                  // Игнорируем ошибки загрузки для недоступных файлов (timeout, network errors)
                  const target = e.target as HTMLAudioElement;
                  if (target.error) {
                    const errorCode = target.error.code;
                    // Коды ошибок: 1=MEDIA_ERR_ABORTED, 2=MEDIA_ERR_NETWORK, 3=MEDIA_ERR_DECODE, 4=MEDIA_ERR_SRC_NOT_SUPPORTED
                    if (errorCode === 2 || errorCode === 4) {
                      // Сетевые ошибки или неподдерживаемый формат - просто игнорируем (не логируем как warning)
                      // console.warn('Аудиофайл недоступен:', question.audioUrl)
                    } else if (errorCode !== 1) {
                      // Игнорируем MEDIA_ERR_ABORTED (код 1) - это нормально при переключении
                      console.error("Ошибка загрузки аудио:", target.error);
                    }
                  }
                  isPlayingRef.current = false;
                  setIsPlaying(false);
                }}
                onAbort={() => {
                  // Игнорируем прерывание - это нормально при быстрых переключениях
                  isPlayingRef.current = false;
                  setIsPlaying(false);
                }}
                onLoadedMetadata={() => {
                  // Аудио успешно загружено
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                  }
                }}
              />
              <div className="flex gap-4">
                <motion.button
                  onClick={isPlaying ? handlePause : handlePlay}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-white px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold backdrop-blur-xl transition-all"
                  style={{
                    background: "transparent",
                    border: "1.5px solid rgba(255, 255, 255, 0.5)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.9)";
                    e.currentTarget.style.color = "#000";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#fff";
                  }}
                >
                  {isPlaying ? "⏸ Пауза" : "▶ Воспроизвести"}
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
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-white p-2 md:p-2.5 rounded-lg backdrop-blur-xl transition-all"
            style={{
              background: "transparent",
              border: "1.5px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
            whileHover={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#000",
            }}
            aria-label="Следующий"
          >
            <svg
              className="w-6 h-6 md:w-8 md:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        ) : (
          <div className="w-10 md:w-12" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {question.options.map((option: string) => {
            const isSelected = showResult && selectedAnswer === option;
            const shouldShowGreen =
              isSelected && option === question.correctAnswer;
            const shouldShowRed =
              isSelected && option !== question.correctAnswer;
            const shouldShowCorrect =
              showResult && option === question.correctAnswer;

            return (
              <motion.button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={showResult}
                whileHover={
                  showResult
                    ? {}
                    : {
                        scale: 1.02,
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        color: "#000",
                      }
                }
                whileTap={{ scale: showResult ? 1 : 0.98 }}
                initial={false}
                className={`min-h-[44px] p-2 md:p-2.5 rounded-lg text-xs md:text-sm font-semibold relative overflow-hidden transition-all cursor-pointer flex items-center justify-center ${
                  shouldShowGreen || shouldShowCorrect
                    ? "bg-green-500 text-white"
                    : shouldShowRed
                    ? "bg-red-500 text-white"
                    : "text-white"
                }`}
                style={{
                  background:
                    shouldShowGreen || shouldShowCorrect
                      ? "rgba(34, 197, 94, 0.8)"
                      : shouldShowRed
                      ? "rgba(239, 68, 68, 0.8)"
                      : "transparent",
                  border:
                    shouldShowGreen || shouldShowCorrect
                      ? "1.5px solid rgba(34, 197, 94, 0.8)"
                      : shouldShowRed
                      ? "1.5px solid rgba(239, 68, 68, 0.8)"
                      : "1.5px solid rgba(255, 255, 255, 0.5)",
                  boxShadow:
                    shouldShowGreen || shouldShowCorrect
                      ? "0 2px 8px rgba(34, 197, 94, 0.3)"
                      : shouldShowRed
                      ? "0 2px 8px rgba(239, 68, 68, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
              >
                {option}
              </motion.button>
            );
          })}
        </div>
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p
            className={`text-2xl font-bold ${
              selectedAnswer === question.correctAnswer
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {selectedAnswer === question.correctAnswer
              ? "✓ Правильно!"
              : "✗ Неправильно"}
          </p>
        </motion.div>
      )}
    </div>
  );
}
