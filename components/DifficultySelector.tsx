"use client";

import { motion } from "framer-motion";

const difficulties = [
  { id: "easy", name: "Легко", emoji: "😊", color: "rgba(34, 197, 94, 0.3)" },
  {
    id: "medium",
    name: "Средне",
    emoji: "🤔",
    color: "rgba(234, 179, 8, 0.3)",
  },
  { id: "hard", name: "Тяжело", emoji: "😤", color: "rgba(220, 38, 38, 0.3)" },
];

const roundNames: Record<string, string> = {
  "guess-face": "Угадай Лицо",
  "bible-quotes": "Библейские Цитаты",
  "guess-voice": "Угадай, Кто Говорит",
};

interface DifficultySelectorProps {
  roundId: string;
  onSelect: (difficulty: string) => void;
  onBack: () => void;
}

export default function DifficultySelector({
  roundId,
  onSelect,
  onBack,
}: DifficultySelectorProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-2 md:px-4 overflow-visible">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        }}
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.2 },
        }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="absolute top-2 left-2 md:top-3 md:left-3 text-white px-3 py-2 md:px-4 md:py-2.5 rounded-lg font-semibold backdrop-blur-xl flex items-center gap-1.5 text-xs md:text-sm z-20"
        style={{
          background: "transparent",
          border: "1.5px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          willChange: "transform",
        }}
      >
        <svg
          className="w-4 h-4 md:w-5 md:h-5"
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
        Назад
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="text-center mb-3 md:mb-4 flex-shrink-0"
      >
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2 drop-shadow-2xl">
          {roundNames[roundId] || "Раунд"}
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xs md:text-sm text-white/70"
        >
          Выберите уровень сложности
        </motion.p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-w-3xl w-full flex-1 py-4 md:py-6"
      >
        {difficulties.map((difficulty) => (
          <motion.div
            key={difficulty.id}
            variants={cardVariants}
            whileHover={{
              scale: 1.05,
              y: -8,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(difficulty.id)}
            className="cursor-pointer relative z-10 hover:z-20"
            style={{ willChange: "transform" }}
          >
            <div
              className="relative rounded-2xl md:rounded-3xl overflow-hidden p-4 md:p-6 h-full flex items-center justify-center"
              style={{
                background: "rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                border: "1px solid rgba(255, 204, 0, 0.4)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 204, 0, 0.2)",
              }}
            >
              <div className="relative text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl mb-2 md:mb-3">
                  {difficulty.emoji}
                </div>
                <h3 className="text-base md:text-lg lg:text-xl font-bold text-white tracking-tight">
                  {difficulty.name}
                </h3>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
