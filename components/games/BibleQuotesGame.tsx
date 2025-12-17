"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface BibleQuotesGameProps {
  question: {
    question: string;
    correctAnswers: string[];
  };
  onAnswer: (isCorrect: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  onBack?: () => void;
}

export default function BibleQuotesGame({
  question,
  onAnswer,
  onNext,
  onPrevious,
  canGoNext = false,
  canGoPrevious = false,
  onBack,
}: BibleQuotesGameProps) {
  const [textInput, setTextInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswerButton, setShowAnswerButton] = useState(false);
  const [revealedAnswerIndex, setRevealedAnswerIndex] = useState(0);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    return question.correctAnswers.some(
      (correct) => correct.toLowerCase().trim() === normalizedAnswer
    );
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCorrect || showingAnswer) return;
    if (!textInput.trim()) return;

    const answer = textInput.trim();
    const correct = checkAnswer(answer);

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      onAnswer(true);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      onAnswer(false);

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
    setRevealedAnswerIndex(
      (prev) => (prev + 1) % question.correctAnswers.length
    );
  };

  const currentRevealedAnswer = question.correctAnswers[revealedAnswerIndex];

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
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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

      {/* Навигация */}
      <div className="flex items-center justify-between mb-3 md:mb-4 pt-10 md:pt-0">
        {canGoPrevious && onPrevious ? (
          <motion.button
            onClick={onPrevious}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#000",
            }}
            whileTap={{ scale: 0.95 }}
            className="text-white p-2 rounded-lg"
            style={{
              background: "transparent",
              border: "1.5px solid rgba(255, 255, 255, 0.5)",
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>
        ) : (
          <div className="w-10" />
        )}

        <h2 className="text-lg md:text-xl font-bold text-center text-white flex-1">
          📖 Библейские Цитаты 🎄
        </h2>

        {canGoNext && onNext ? (
          <motion.button
            onClick={onNext}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#000",
            }}
            whileTap={{ scale: 0.95 }}
            className="text-white p-2 rounded-lg"
            style={{
              background: "transparent",
              border: "1.5px solid rgba(255, 255, 255, 0.5)",
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Вопрос */}
      <div className="mb-3 md:mb-4 flex-shrink-0">
        <div
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
          className="rounded-lg p-3 md:p-4 mb-2 backdrop-blur-md"
        >
          <p className="text-sm md:text-base text-white text-center leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* Счетчик попыток */}
        <p className="text-white/60 text-center text-xs">
          Попыток: {attempts}/3
        </p>
      </div>

      {/* Форма ввода */}
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
            {question.correctAnswers.length > 1 && (
              <p className="text-white/50 text-xs mt-1">
                (ответ {revealedAnswerIndex + 1} из{" "}
                {question.correctAnswers.length})
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
