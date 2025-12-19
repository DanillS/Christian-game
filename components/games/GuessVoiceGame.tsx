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
  onBack?: () => void;
}

export default function GuessVoiceGame({
  question,
  onAnswer,
  onNext,
  onPrevious,
  canGoNext = false,
  canGoPrevious = false,
  onBack,
}: GuessVoiceGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const isPlayingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Проверка текстового ввода
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCorrect) return;
    if (!textInput.trim()) return;

    const answer = textInput.trim();
    setSelectedAnswer(answer);
    
    // Проверяем ответ (без учета регистра)
    const correct = answer.toLowerCase() === question.correctAnswer.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      handlePause();
      onAnswer(correct);
    } else {
      onAnswer(correct);
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowResult(false);
        setIsCorrect(false);
        setTextInput("");
        inputRef.current?.focus();
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
      className="backdrop-blur-md rounded-xl p-4 md:p-5 h-full flex flex-col overflow-y-auto overflow-x-hidden relative min-h-0"
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
        🎤 Угадай, кто говорит 🎄
      </h2>

      <div className="mb-3 md:mb-4 flex justify-center items-center gap-4 md:gap-6 flex-shrink-0">
        {/* Левая стрелка */}
        {canGoPrevious && onPrevious ? (
          <motion.button
            onClick={onPrevious}
            whileHover={{
              scale: 1.1,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#000",
            }}
            whileTap={{ scale: 0.95 }}
            className="text-white p-2 md:p-2.5 rounded-lg backdrop-blur-xl transition-all"
            style={{
              background: "transparent",
              border: "1.5px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
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
            className="w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center mb-4 backdrop-blur-md overflow-hidden relative"
          >
            {showResult &&
            isCorrect &&
            isOriginalVideo &&
            question.originalAudioUrl ? (
              <video
                ref={originalVideoRef}
                key={question.originalAudioUrl}
                src={question.originalAudioUrl}
                controls
                preload="auto"
                crossOrigin="anonymous"
                className="w-full h-full object-cover rounded-full"
                onEnded={() => setIsPlayingOriginal(false)}
                onPause={() => setIsPlayingOriginal(false)}
                onPlay={() => setIsPlayingOriginal(true)}
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
            ) : (
              <span className="text-6xl md:text-7xl">🎤</span>
            )}
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

                {showResult && isCorrect && question.originalAudioUrl && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={
                      isPlayingOriginal
                        ? handlePauseOriginal
                        : handlePlayOriginal
                    }
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
                    {isPlayingOriginal
                      ? "⏸ Остановить"
                      : isOriginalVideo
                      ? "🎬 Видео оригинал"
                      : "🎵 Аудио оригинал"}
                  </motion.button>
                )}
              </div>

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
            whileHover={{
              scale: 1.1,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#000",
            }}
            whileTap={{ scale: 0.95 }}
            className="text-white p-2 md:p-2.5 rounded-lg backdrop-blur-xl transition-all"
            style={{
              background: "transparent",
              border: "1.5px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
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

      <div className="flex-1 min-h-0 px-1 pb-3 md:pb-4">
        <form onSubmit={handleTextSubmit} className="space-y-3">
          <motion.div
            animate={{
              borderColor: showResult
                ? isCorrect
                  ? "rgba(34, 197, 94, 0.8)"
                  : "rgba(239, 68, 68, 0.8)"
                : "rgba(255, 255, 255, 0.5)",
              backgroundColor: showResult
                ? isCorrect
                  ? "rgba(34, 197, 94, 0.2)"
                  : "rgba(239, 68, 68, 0.2)"
                : "rgba(255, 255, 255, 0.1)",
            }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <input
              ref={inputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={showResult && isCorrect}
              placeholder="Введите ответ..."
              className="w-full px-4 py-3 rounded-xl bg-transparent text-white placeholder-white/50 border-2 focus:outline-none focus:border-white/80 transition-all text-sm md:text-base"
              style={{
                border: showResult
                  ? isCorrect
                    ? "2px solid rgba(34, 197, 94, 0.8)"
                    : "2px solid rgba(239, 68, 68, 0.8)"
                  : "2px solid rgba(255, 255, 255, 0.5)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                backdropFilter: "blur(10px)",
              }}
              autoComplete="off"
            />
          </motion.div>
          
          <motion.button
            type="submit"
            disabled={showResult && isCorrect}
            whileHover={
              showResult && isCorrect
                ? {}
                : { scale: 1.02 }
            }
            whileTap={{ scale: showResult && isCorrect ? 1 : 0.98 }}
            className="w-full py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50 relative z-10"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "2px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              backdropFilter: "blur(10px)",
            }}
          >
            Проверить
          </motion.button>
          <div className="h-3 md:h-4"></div>
        </form>
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
