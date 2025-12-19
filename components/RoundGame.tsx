"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GuessFaceGame from "./games/GuessFaceGame";
import BibleQuotesGame from "./games/BibleQuotesGame";
import GuessVoiceGame from "./games/GuessVoiceGame";
import { getRoundData } from "@/data/roundData";

interface RoundGameProps {
  roundId: string;
  initialQuestionIndex: number;
  onBack: () => void;
  onQuestionComplete: (newIndex: number) => void;
}

export default function RoundGame({
  roundId,
  initialQuestionIndex,
  onBack,
  onQuestionComplete,
}: RoundGameProps) {
  const [currentIndex, setCurrentIndex] = useState(initialQuestionIndex);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map()); // Сохраняем правильный ответ для каждого вопроса
  const [wrongAnswers, setWrongAnswers] = useState<Map<number, string[]>>(
    new Map()
  ); // Сохраняем все неправильные ответы для каждого вопроса

  useEffect(() => {
    let ignore = false;
    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        // Добавляем cache-busting параметр для избежания кеширования старых данных
        const cacheBuster = `?t=${Date.now()}`;
        const response = await fetch(
          `/api/round-data/${roundId}${cacheBuster}`,
          {
            cache: "no-store",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to load round data");
        }
        const payload = await response.json();
        if (!ignore) {
          const apiQuestions = Array.isArray(payload.questions)
            ? payload.questions
            : [];
          if (apiQuestions.length > 0) {
            setQuestions(apiQuestions);
          } else {
            // Fallback на локальные данные
            const localData = getRoundData(roundId);
            setQuestions(localData);
          }
        }
      } catch (error) {
        console.error("[RoundGame] Ошибка загрузки вопросов", error);
        if (!ignore) {
          // Fallback на локальные данные
          const localData = getRoundData(roundId);
          setQuestions(localData);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadQuestions();

    return () => {
      ignore = true;
    };
  }, [roundId]);

  useEffect(() => {
    const saved = localStorage.getItem(`used-${roundId}`);
    if (saved) {
      setUsedQuestions(JSON.parse(saved));
    } else {
      setUsedQuestions([]);
    }
  }, [roundId]);

  useEffect(() => {
    setCurrentIndex(initialQuestionIndex);
  }, [initialQuestionIndex]);

  // Для всех раундов показываем полный список вопросов (навигируем по всем)
  const availableQuestions = useMemo(() => {
    return questions;
  }, [questions]);

  const handleAnswer = (answer: string, isCorrect: boolean) => {
    if (questions.length === 0) return;

    // Индекс текущего вопроса в общем списке
    const originalIndex =
      questions.length > 0 ? currentIndex % questions.length : -1;

    if (originalIndex === -1) return;

    if (isCorrect) {
      // Сохраняем правильный ответ
      setAnswers((prev) => {
        const newAnswers = new Map(prev);
        newAnswers.set(originalIndex, answer);
        return newAnswers;
      });

      // Для guess-face НЕ добавляем в usedQuestions сразу - только при переходе на другой вопрос
      if (roundId !== "guess-face") {
        const newUsed = [...usedQuestions, originalIndex];

        // Если все вопросы использованы, сбрасываем список
        if (newUsed.length >= questions.length) {
          setUsedQuestions([]);
          localStorage.removeItem(`used-${roundId}`);
        } else {
          setUsedQuestions(newUsed);
          localStorage.setItem(`used-${roundId}`, JSON.stringify(newUsed));
        }
      }
    } else {
      // Сохраняем неправильный ответ (добавляем в массив)
      setWrongAnswers((prev) => {
        const newWrongAnswers = new Map(prev);
        const currentWrong = newWrongAnswers.get(originalIndex) || [];
        if (!currentWrong.includes(answer)) {
          newWrongAnswers.set(originalIndex, [...currentWrong, answer]);
        }
        return newWrongAnswers;
      });
    }
  };

  const handleNext = () => {
    if (questions.length === 0) return;

    const nextIndex = (currentIndex + 1) % questions.length;
    setCurrentIndex(nextIndex);
    onQuestionComplete(nextIndex);
  };

  const handlePrevious = () => {
    if (questions.length === 0) return;
    const prevIndex =
      currentIndex === 0 ? questions.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    onQuestionComplete(prevIndex);
  };

  const currentQuestion =
    questions.length > 0 ? questions[currentIndex % questions.length] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-white"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-5xl mb-4"
          >
            ⭐
          </motion.div>
          <p className="text-xl md:text-2xl">Загрузка...</p>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center text-white"
        >
          <p className="text-xl md:text-2xl mb-6">Пока нет вопросов.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="text-white px-6 py-3 rounded-xl font-bold backdrop-blur-md flex items-center gap-2"
            style={{
              background:
                "linear-gradient(135deg, rgba(220, 38, 38, 0.4) 0%, rgba(22, 163, 74, 0.4) 50%, rgba(234, 179, 8, 0.4) 100%)",
              border: "2px solid rgba(234, 179, 8, 0.5)",
              boxShadow: "0 4px 15px rgba(234, 179, 8, 0.3)",
              willChange: "transform",
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
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Назад
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const renderGame = (onBackHandler?: () => void) => {
    // Получаем сохраненные ответы для текущего вопроса
    const currentQuestionIndex = questions.indexOf(currentQuestion);
    const savedAnswer =
      currentQuestionIndex !== -1 ? answers.get(currentQuestionIndex) : null;
    const savedWrongAnswers =
      currentQuestionIndex !== -1
        ? wrongAnswers.get(currentQuestionIndex) || []
        : [];

    // Всегда показываем обе стрелки, если вопросов больше одного (циклическая навигация)
    // Используем questions.length, так как availableQuestions может быть пустым на момент первого рендера
    const showArrows = questions.length > 1;

    switch (roundId) {
      case "guess-face":
        return (
          <GuessFaceGame
            question={currentQuestion}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={showArrows}
            canGoPrevious={showArrows}
            savedAnswer={savedAnswer}
            savedWrongAnswers={savedWrongAnswers}
            onBack={onBackHandler}
          />
        );
      case "bible-quotes":
        return (
          <BibleQuotesGame
            question={currentQuestion}
            onAnswer={(isCorrect) => handleAnswer("", isCorrect)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={showArrows}
            canGoPrevious={showArrows}
            onBack={onBackHandler}
          />
        );
      case "guess-voice":
        return (
          <GuessVoiceGame
            question={currentQuestion}
            onAnswer={(isCorrect) => handleAnswer("", isCorrect)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={showArrows}
            canGoPrevious={showArrows}
            onBack={onBackHandler}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-2 md:px-4 relative overflow-y-auto overflow-x-hidden min-h-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="w-full h-full max-w-4xl overflow-y-auto overflow-x-hidden flex items-center justify-center min-h-0"
        >
          <div className="w-full h-full overflow-y-auto overflow-x-hidden min-h-0">
            {renderGame(onBack)}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
