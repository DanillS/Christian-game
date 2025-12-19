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
  const [textInput, setTextInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswerButton, setShowAnswerButton] = useState(false);
  const [revealedAnswerIndex, setRevealedAnswerIndex] = useState(0);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Нормализация данных — поддержка старого и нового формата
  const correctAnswers =
    question.correctAnswers ||
    (question.correctAnswer
      ? question.correctAnswer.includes(" | ")
        ? question.correctAnswer.split(" | ")
        : [question.correctAnswer]
      : []);

  // Сброс состояния при смене вопроса
  useEffect(() => {
    setTextInput("");
    setAttempts(0);
    setShowResult(false);
    setIsCorrect(false);
    setShowAnswerButton(false);
    setRevealedAnswerIndex(0);
    setShowingAnswer(false);
  }, [question]);

  const checkAnswer = (answer: string): boolean => {
    const normalizedAnswer = answer.toLowerCase().trim();
    return correctAnswers.some(
      (correct) => correct.toLowerCase().trim() === normalizedAnswer
    );
  };

  // Проверка текстового ввода
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCorrect || showingAnswer) return;
    if (!textInput.trim()) return;

    const answer = textInput.trim();
    const correct = checkAnswer(answer);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      onAnswer(answer, true);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      onAnswer(answer, false);

      if (newAttempts >= 3) {
        setShowAnswerButton(true);
      }

      setTimeout(() => {
        setShowResult(false);
        setTextInput("");
        inputRef.current?.focus();
      }, 1500);
    }
  };

  const handleShowAnswer = () => {
    setShowingAnswer(true);
    // Циклический показ ответов
    setRevealedAnswerIndex((prev) => (prev + 1) % correctAnswers.length);
  };

  const currentRevealedAnswer = correctAnswers[revealedAnswerIndex];

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
          className="absolute top-2 left-2 md:top-3 md:left-3 text-white p-1.5 md:px-3 md:py-2 rounded-lg font-semibold backdrop-blur-xl flex items-center gap-1 md:gap-1.5 text-xs md:text-sm z-10"
          style={{
            background: "transparent",
            border: "1.5px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            willChange: "transform",
          }}
        >
          <svg
            className="w-4 h-4 md:w-4 md:h-4"
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

      {/* Счетчик попыток */}
      {!isCorrect && (
        <p className="text-white/60 text-center text-xs mb-3 md:mb-4">
          Попыток: {attempts}/3
        </p>
      )}

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
              disabled={isCorrect || showingAnswer}
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
            disabled={isCorrect || showingAnswer}
            whileHover={isCorrect || showingAnswer ? {} : { scale: 1.02 }}
            whileTap={{ scale: isCorrect || showingAnswer ? 1 : 0.98 }}
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

        {/* Кнопка показать ответ */}
        {showAnswerButton && !isCorrect && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleShowAnswer}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-3 py-3 rounded-xl text-white font-medium transition-all relative z-10"
            style={{
              background: "rgba(255, 193, 7, 0.3)",
              border: "2px solid rgba(255, 193, 7, 0.6)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              backdropFilter: "blur(10px)",
            }}
          >
            {showingAnswer ? "Показать другой ответ" : "Показать ответ"}
          </motion.button>
        )}

        {/* Показ правильного ответа */}
        {showingAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-xl text-center"
            style={{
              background: "rgba(255, 193, 7, 0.2)",
              border: "1px solid rgba(255, 193, 7, 0.4)",
            }}
          >
            <p className="text-white/80 text-xs mb-1">Правильный ответ:</p>
            <p className="text-yellow-300 font-semibold">
              {currentRevealedAnswer}
            </p>
            {correctAnswers.length > 1 && (
              <p className="text-white/50 text-xs mt-1">
                (ответ {revealedAnswerIndex + 1} из {correctAnswers.length})
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Результат */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 md:mt-3 text-center flex-shrink-0"
        >
          <p
            className={`text-base md:text-lg font-bold ${
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
