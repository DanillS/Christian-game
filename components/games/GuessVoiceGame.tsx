"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface GuessVoiceGameProps {
  question: any;
  onAnswer: (isCorrect: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
}

export default function GuessVoiceGame({
  question,
  onAnswer,
  onNext,
  onPrevious,
  canGoNext = false,
  canGoPrevious = false,
}: GuessVoiceGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const isPlayingRef = useRef(false);

  // Определяем, является ли оригинал видео
  const isOriginalVideo =
    question.originalAudioUrl &&
    (question.originalAudioUrl.endsWith(".mp4") ||
      question.originalAudioUrl.endsWith(".webm") ||
      question.originalAudioUrl.endsWith(".mov") ||
      question.originalAudioUrl.endsWith(".avi"));

  // Обновление аудио при смене вопроса (БЕЗ сброса состояния)
  useEffect(() => {
    if (!question?.audioUrl) return;

    console.log(
      "[GuessVoiceGame] Смена вопроса, новый audioUrl:",
      question.audioUrl
    );

    // Останавливаем воспроизведение
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPlayingOriginal(false);

    // Обновляем src аудио элемента
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = question.audioUrl;
      audioRef.current.load();
      console.log("[GuessVoiceGame] Аудио обновлено:", audioRef.current.src);
    }

    // Обновляем src оригинального аудио/видео
    if (question.originalAudioUrl) {
      const isVideo =
        question.originalAudioUrl.endsWith(".mp4") ||
        question.originalAudioUrl.endsWith(".webm") ||
        question.originalAudioUrl.endsWith(".mov") ||
        question.originalAudioUrl.endsWith(".avi");

      if (isVideo && originalVideoRef.current) {
        originalVideoRef.current.pause();
        originalVideoRef.current.currentTime = 0;
        originalVideoRef.current.src = question.originalAudioUrl;
        originalVideoRef.current.load();
      } else if (!isVideo && originalAudioRef.current) {
        originalAudioRef.current.pause();
        originalAudioRef.current.currentTime = 0;
        originalAudioRef.current.src = question.originalAudioUrl;
        originalAudioRef.current.load();
      }
    }
  }, [question?.audioUrl]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (originalAudioRef.current) {
        originalAudioRef.current.pause();
        originalAudioRef.current.src = "";
      }
      if (originalVideoRef.current) {
        originalVideoRef.current.pause();
        originalVideoRef.current.src = "";
      }
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsPlayingOriginal(false);
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

  const handlePlayOriginal = async () => {
    if (isPlayingOriginal) return;

    const mediaRef = isOriginalVideo
      ? originalVideoRef.current
      : originalAudioRef.current;
    if (!mediaRef) return;

    // Останавливаем обычное аудио
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
    }

    try {
      // Проверяем готовность медиа
      if (mediaRef.readyState >= 2) {
        await mediaRef.play();
        setIsPlayingOriginal(true);
      } else {
        // Ждем загрузки
        mediaRef.addEventListener(
          "canplay",
          async () => {
            try {
              await mediaRef.play();
              setIsPlayingOriginal(true);
            } catch (err) {
              if (err instanceof Error && err.name !== "AbortError") {
                console.error("Ошибка воспроизведения оригинала:", err);
              }
              setIsPlayingOriginal(false);
            }
          },
          { once: true }
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Ошибка воспроизведения оригинала:", error);
      }
      setIsPlayingOriginal(false);
    }
  };

  const handlePauseOriginal = () => {
    const mediaRef = isOriginalVideo
      ? originalVideoRef.current
      : originalAudioRef.current;
    if (mediaRef) {
      mediaRef.pause();
      setIsPlayingOriginal(false);
    }
  };

  const handleSelect = (answer: string) => {
    if (isCorrect) return; // Блокируем только если уже угадали правильно
    if (selectedAnswer !== null) return; // Блокируем, если идёт анимация

    setSelectedAnswer(answer);
    const correct = answer === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      // Правильный ответ - останавливаем аудио и показываем результат
      handlePause();
      onAnswer(correct);
    } else {
      // Неправильный ответ - показываем анимацию и держим 2 секунды
      onAnswer(correct);
      // Держим результат 2 секунды, чтобы пользователь успел увидеть и понять
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowResult(false);
        setIsCorrect(false);
      }, 2000);
    }
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(22, 163, 74, 0.15) 50%, rgba(234, 179, 8, 0.15) 100%)",
        border: "3px solid rgba(234, 179, 8, 0.5)",
        boxShadow: "0 8px 32px rgba(234, 179, 8, 0.3)",
      }}
      className="backdrop-blur-md rounded-3xl p-6 md:p-8"
    >
      <h2
        style={{
          background:
            "linear-gradient(90deg, #dc2626 0%, #16a34a 50%, #eab308 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
        className="text-2xl md:text-3xl font-bold mb-6 text-center"
      >
        🎤 Угадай, кто говорит 🎄
      </h2>

      <div className="mb-6 flex justify-center items-center gap-2">
        {/* Левая стрелка */}
        {canGoPrevious && onPrevious ? (
          <motion.button
            onClick={onPrevious}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background:
                "linear-gradient(135deg, rgba(220, 38, 38, 0.4) 0%, rgba(234, 179, 8, 0.4) 100%)",
              border: "2px solid rgba(234, 179, 8, 0.5)",
              boxShadow: "0 4px 12px rgba(234, 179, 8, 0.3)",
            }}
            className="text-white p-3 rounded-full backdrop-blur-md"
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
              background:
                "linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(22, 163, 74, 0.3) 50%, rgba(234, 179, 8, 0.3) 100%)",
              border: "3px solid rgba(234, 179, 8, 0.6)",
              boxShadow: "0 0 30px rgba(234, 179, 8, 0.4)",
            }}
            className="w-32 h-32 rounded-full flex items-center justify-center mb-4 backdrop-blur-md"
          >
            <span className="text-6xl">🎤</span>
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
              {question.originalAudioUrl && !isOriginalVideo && (
                <audio
                  key={question.originalAudioUrl}
                  ref={originalAudioRef}
                  src={question.originalAudioUrl}
                  preload="auto"
                  crossOrigin="anonymous"
                  onEnded={() => {
                    setIsPlayingOriginal(false);
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLAudioElement;
                    if (target.error) {
                      const errorCode = target.error.code;
                      if (errorCode === 2 || errorCode === 4) {
                        // Сетевые ошибки или неподдерживаемый формат - просто игнорируем
                      } else if (errorCode !== 1) {
                        console.error(
                          "Ошибка загрузки оригинального аудио:",
                          target.error
                        );
                      }
                    }
                    setIsPlayingOriginal(false);
                  }}
                  onAbort={() => {
                    setIsPlayingOriginal(false);
                  }}
                  onLoadedMetadata={() => {
                    if (originalAudioRef.current) {
                      originalAudioRef.current.currentTime = 0;
                    }
                  }}
                />
              )}
              {question.originalAudioUrl && isOriginalVideo && (
                <video
                  key={question.originalAudioUrl}
                  ref={originalVideoRef}
                  src={question.originalAudioUrl}
                  preload="auto"
                  crossOrigin="anonymous"
                  className="hidden"
                  onEnded={() => {
                    setIsPlayingOriginal(false);
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLVideoElement;
                    if (target.error) {
                      const errorCode = target.error.code;
                      if (errorCode === 2 || errorCode === 4) {
                        // Сетевые ошибки или неподдерживаемый формат - просто игнорируем
                      } else if (errorCode !== 1) {
                        console.error(
                          "Ошибка загрузки оригинального видео:",
                          target.error
                        );
                      }
                    }
                    setIsPlayingOriginal(false);
                  }}
                  onAbort={() => {
                    setIsPlayingOriginal(false);
                  }}
                  onLoadedMetadata={() => {
                    if (originalVideoRef.current) {
                      originalVideoRef.current.currentTime = 0;
                    }
                  }}
                />
              )}
              <div className="flex gap-4">
                <motion.button
                  onClick={isPlaying ? handlePause : handlePlay}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(220, 38, 38, 0.4) 0%, rgba(22, 163, 74, 0.4) 100%)",
                    border: "2px solid rgba(234, 179, 8, 0.6)",
                    boxShadow: "0 4px 15px rgba(234, 179, 8, 0.3)",
                  }}
                  className="text-white px-6 py-3 rounded-xl text-lg font-bold backdrop-blur-md"
                >
                  {isPlaying ? "⏸ Пауза" : "▶ Воспроизвести"}
                </motion.button>

                {showResult && isCorrect && question.originalAudioUrl && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={
                      isPlayingOriginal
                        ? handlePauseOriginal
                        : handlePlayOriginal
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background:
                        "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                      border: "2px solid #22c55e",
                      boxShadow: "0 4px 20px rgba(34, 197, 94, 0.5)",
                    }}
                    className="text-white px-6 py-3 rounded-xl text-lg font-bold"
                  >
                    {isPlayingOriginal
                      ? "⏸ Остановить"
                      : isOriginalVideo
                      ? "🎬 Видео оригинал"
                      : "🎵 Аудио оригинал"}
                  </motion.button>
                )}
              </div>

              {/* Видеоплеер для оригинала */}
              {showResult &&
                isCorrect &&
                isOriginalVideo &&
                isPlayingOriginal && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 rounded-lg overflow-hidden border-2 border-green-400"
                  >
                    <video
                      src={question.originalAudioUrl}
                      controls
                      autoPlay
                      className="w-full max-w-md mx-auto rounded-lg"
                      onEnded={() => setIsPlayingOriginal(false)}
                      onPause={() => setIsPlayingOriginal(false)}
                    />
                  </motion.div>
                )}

              <p className="text-white/60 text-sm mt-2 text-center">
                Звук может быть неестественным
              </p>
            </>
          )}

          {!question.audioUrl && (
            <p className="text-white/80 text-center">
              Аудиофайл не загружен. Добавьте файл в data/guessVoiceData.ts
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
              background:
                "linear-gradient(135deg, rgba(22, 163, 74, 0.4) 0%, rgba(234, 179, 8, 0.4) 100%)",
              border: "2px solid rgba(234, 179, 8, 0.5)",
              boxShadow: "0 4px 12px rgba(234, 179, 8, 0.3)",
            }}
            className="text-white p-3 rounded-full backdrop-blur-md"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option: string) => {
          const isSelected = showResult && selectedAnswer === option;
          const shouldShowGreen = isSelected && isCorrect;
          const shouldShowRed = isSelected && !isCorrect;

          return (
            <motion.button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={showResult && isCorrect}
              whileHover={{ scale: showResult && isCorrect ? 1 : 1.05 }}
              whileTap={{ scale: showResult && isCorrect ? 1 : 0.95 }}
              initial={false}
              style={{
                background: shouldShowGreen
                  ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                  : shouldShowRed
                  ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                  : "linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(22, 163, 74, 0.3) 50%, rgba(234, 179, 8, 0.3) 100%)",
                boxShadow: shouldShowGreen
                  ? "0 4px 20px rgba(34, 197, 94, 0.4)"
                  : shouldShowRed
                  ? "0 4px 20px rgba(239, 68, 68, 0.4)"
                  : "0 4px 15px rgba(234, 179, 8, 0.3)",
                border: shouldShowGreen
                  ? "2px solid #22c55e"
                  : shouldShowRed
                  ? "2px solid #ef4444"
                  : "2px solid rgba(234, 179, 8, 0.5)",
              }}
              transition={{
                duration: shouldShowRed ? 0.5 : 0.3,
                ease: "easeOut",
              }}
              className="p-4 rounded-xl text-lg font-bold text-white backdrop-blur-md relative overflow-hidden shadow-lg"
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {showResult && isCorrect && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p className="text-2xl font-bold text-green-400">✓ Правильно!</p>
        </motion.div>
      )}

      {showResult && !isCorrect && selectedAnswer !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p className="text-2xl font-bold text-red-400">✗ Неправильно</p>
        </motion.div>
      )}
    </div>
  );
}
