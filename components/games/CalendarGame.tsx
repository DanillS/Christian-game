"use client";

import { useState } from "react";
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
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    const isCorrect = answer === question.correctAnswer;
    setShowResult(true);

    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedAnswer(null);
      setShowResult(false);
    }, 2000);
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
            style={{
              border: "3px solid rgba(234, 179, 8, 0.6)",
              boxShadow: "0 0 30px rgba(234, 179, 8, 0.4)",
            }}
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
