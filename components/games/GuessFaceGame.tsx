"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface GuessFaceGameProps {
  question: any;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  savedAnswer?: string | null;
  savedWrongAnswers?: string[];
  onBack?: () => void;
}

export default function GuessFaceGame({
  question,
  onAnswer,
  onNext,
  onPrevious,
  canGoNext = true,
  canGoPrevious = true,
  savedAnswer = null,
  savedWrongAnswers = [],
  onBack,
}: GuessFaceGameProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    savedAnswer || null
  );
  const [textInput, setTextInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // При смене вопроса НЕ сбрасываем состояние (как в GuessVoiceGame)
  // useEffect убран, чтобы сохранять состояние при навигации

  const handleSelect = (answer: string) => {
    if (isCorrect) return; // Блокируем только если уже угадали правильно
    if (selectedAnswer !== null && !isCorrect) return; // Блокируем, если идёт анимация

    setSelectedAnswer(answer);
    const correct = answer === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      // Правильный ответ
      onAnswer(answer, true);
    } else {
      // Неправильный ответ - показываем анимацию и держим 2 секунды
      onAnswer(answer, false);
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
    
    const correct = answer.toLowerCase() === question.correctAnswer.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      onAnswer(answer, true);
    } else {
      onAnswer(answer, false);
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowResult(false);
        setIsCorrect(false);
        setTextInput("");
        inputRef.current?.focus();
      }, 2000);
    }
  };

  // Показываем полную фотографию только если правильно ответили
  const imageToShow =
    isCorrect && question.fullImage ? question.fullImage : question.image;

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
        👤 Угадай по фрагментам 🎄
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

        {/* Изображение */}
        <div
          style={{
            border: "2px solid rgba(255, 255, 255, 0.9)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          }}
          className="relative w-64 h-64 md:w-80 md:h-80 bg-white/20 rounded-xl overflow-hidden backdrop-blur-md"
        >
          <Image
            src={imageToShow}
            alt={isCorrect ? "Полная фотография" : "Часть тела"}
            width={320}
            height={320}
            className="object-cover w-full h-full"
            unoptimized
          />
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

      <div className="flex-1 overflow-y-auto min-h-0 px-1">
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
        </form>
      </div>

      {/* Сообщение о результате */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p
            className={`text-2xl font-bold ${
              isCorrect ? "text-green-400" : "text-red-400"
            }`}
          >
            {isCorrect ? "✓ Правильно!" : "✗ Неправильно"}
          </p>
        </motion.div>
      )}
    </div>
  );
}
