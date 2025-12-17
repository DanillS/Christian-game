"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface CalendarGameProps {
  question: any;
  onAnswer: (isCorrect: boolean) => void;
  onBack?: () => void;
}

export default function CalendarGame({
  question,
  onAnswer,
  onBack,
}: CalendarGameProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    const correct = answer === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(correct);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    }, 2000);
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
      setTimeout(() => {
        onAnswer(true);
      }, 1500);
    } else {
      setTimeout(() => {
        onAnswer(false);
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
        📅{" "}
        {question.questionType === "date"
          ? "Угадай дату"
          : "Угадай день рождения"}{" "}
        🎄
      </h2>

      {question.questionType === "date" && question.image && (
        <div className="mb-4 md:mb-6 flex justify-center">
          <div
            className="relative w-full max-w-md md:max-w-lg lg:max-w-xl aspect-square bg-white/20 rounded-xl overflow-hidden backdrop-blur-md"
            style={{
              border: "2px solid rgba(255, 255, 255, 0.9)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Image
              src={question.image}
              alt="Фото"
              width={400}
              height={400}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        </div>
      )}

      {question.questionType === "birthday" && question.date && (
        <div className="mb-4 md:mb-6">
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(22, 163, 74, 0.2) 50%, rgba(234, 179, 8, 0.2) 100%)",
              border: "2px solid rgba(234, 179, 8, 0.5)",
              boxShadow: "0 4px 20px rgba(234, 179, 8, 0.3)",
            }}
            className="rounded-2xl p-4 md:p-6 mb-4 backdrop-blur-md"
          >
            <p className="text-xl md:text-2xl lg:text-3xl text-white text-center font-bold">
              {question.date}
            </p>
          </div>
          <p className="text-white/80 text-center text-base md:text-lg">
            У кого день рождения в эту дату?
          </p>
        </div>
      )}

      <div className="flex-1 overflow-visible min-h-0">
        <form onSubmit={handleTextSubmit} className="space-y-3 overflow-visible">
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

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 md:mt-6 text-center"
        >
          <p
            className={`text-xl md:text-2xl font-bold ${
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
