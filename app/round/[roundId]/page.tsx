"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import RoundGame from "@/components/RoundGame";
import SnowAnimation from "@/components/SnowAnimation";
import StarsBackground from "@/components/StarsBackground";
import SystemStatusBar from "@/components/SystemStatusBar";
import HomeIndicator from "@/components/HomeIndicator";

export default function RoundPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = params.roundId as string;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    // Сохраняем текущий путь
    localStorage.setItem("lastPath", `/round/${roundId}`);

    const saved = localStorage.getItem(`progress-${roundId}`);
    if (saved) {
      const progress = JSON.parse(saved);
      setCurrentQuestionIndex(progress.questionIndex || 0);
    } else {
      setCurrentQuestionIndex(0);
    }
  }, [roundId]);

  const handleQuestionComplete = (newIndex: number) => {
    setCurrentQuestionIndex(newIndex);
    localStorage.setItem(
      `progress-${roundId}`,
      JSON.stringify({ questionIndex: newIndex })
    );
  };

  const handleBack = async () => {
    // Проверяем, все ли вопросы пройдены
    const savedAnswers = localStorage.getItem(`answers-${roundId}`);
    if (savedAnswers) {
      try {
        const answersData = JSON.parse(savedAnswers);
        const answeredIndices = Object.keys(answersData).map(Number);
        
        // Загружаем вопросы для проверки
        try {
          const cacheBuster = `?t=${Date.now()}`;
          const response = await fetch(
            `/api/round-data/${roundId}${cacheBuster}`,
            { cache: "no-store" }
          );
          if (response.ok) {
            const payload = await response.json();
            const apiQuestions = Array.isArray(payload.questions)
              ? payload.questions
              : [];
            
            // Если все вопросы имеют правильные ответы - очищаем результаты
            if (apiQuestions.length > 0 && answeredIndices.length >= apiQuestions.length) {
              // Проверяем, что все индексы от 0 до questions.length-1 есть в ответах
              const allIndices = Array.from({ length: apiQuestions.length }, (_, i) => i);
              const allCompleted = allIndices.every(index => answeredIndices.includes(index));
              
              if (allCompleted) {
                // Все вопросы пройдены - очищаем результаты
                localStorage.removeItem(`answers-${roundId}`);
                localStorage.removeItem(`wrongAnswers-${roundId}`);
                localStorage.removeItem(`progress-${roundId}`);
              }
            }
          }
        } catch (error) {
          console.error("Ошибка проверки завершенности:", error);
        }
      } catch (e) {
        console.error("Ошибка проверки ответов:", e);
      }
    }
    
    router.push("/");
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 relative overflow-hidden flex items-center justify-center p-2 md:p-4">
      <StarsBackground />
      <SnowAnimation />
      <div className="w-full h-full max-w-sm md:max-w-2xl lg:max-w-4xl relative flex items-center justify-center">
        {/* iOS/iPad device frame */}
        <div
          className="relative rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] p-2 md:p-3 lg:p-4 w-full h-full max-h-[95vh] flex flex-col"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.3) 100%)",
            boxShadow:
              "0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Screen с градиентом */}
          <div
            className="rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden relative flex flex-col flex-1"
            style={{
              background:
                "linear-gradient(to bottom, rgba(30, 58, 138, 0.7), rgba(30, 64, 175, 0.7), rgba(22, 101, 52, 0.7))",
              boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Системная строка с часами */}
            <SystemStatusBar />

            {/* Контент с скроллом на мобильных */}
            <div className="flex-1 flex items-center justify-center overflow-y-auto overflow-x-hidden pt-10 md:pt-12 pb-12 md:pb-14 min-h-0">
              <RoundGame
                roundId={roundId}
                initialQuestionIndex={currentQuestionIndex}
                onBack={handleBack}
                onQuestionComplete={handleQuestionComplete}
              />
            </div>

            {/* Home Indicator */}
            <HomeIndicator />
          </div>
        </div>
      </div>
    </div>
  );
}
