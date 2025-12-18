"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SnowAnimation from "@/components/SnowAnimation";
import StarsBackground from "@/components/StarsBackground";
import SystemStatusBar from "@/components/SystemStatusBar";
import HomeIndicator from "@/components/HomeIndicator";
import GarlandLights from "@/components/GarlandLights";

const PASSWORD = "1996"; // Пароль можно изменить здесь

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Загружаем состояние попыток из localStorage
  useEffect(() => {
    const savedAttempts = localStorage.getItem("loginAttempts");
    const blockUntil = localStorage.getItem("blockUntil");

    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts, 10));
    }

    if (blockUntil) {
      const blockTime = parseInt(blockUntil, 10);
      const now = Date.now();
      if (now < blockTime) {
        setIsBlocked(true);
        setBlockTimeLeft(Math.ceil((blockTime - now) / 1000));
      } else {
        localStorage.removeItem("blockUntil");
        localStorage.removeItem("loginAttempts");
        setAttempts(0);
      }
    }
  }, []);

  // Таймер блокировки
  useEffect(() => {
    if (isBlocked && blockTimeLeft > 0) {
      const timer = setInterval(() => {
        setBlockTimeLeft((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            localStorage.removeItem("blockUntil");
            localStorage.removeItem("loginAttempts");
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isBlocked, blockTimeLeft]);

  // Блокируем ввод с физической клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!["Backspace", "Delete", "Enter", "Escape"].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Фокусируем скрытый input для предотвращения появления клавиатуры на мобильных
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Автоматическая проверка пароля при вводе 4 цифр
  useEffect(() => {
    if (password.length === 4 && !isBlocked) {
      const timer = setTimeout(() => {
        if (password === PASSWORD) {
          localStorage.setItem("authenticated", "true");
          localStorage.removeItem("loginAttempts");
          localStorage.removeItem("blockUntil");
          const lastPath = localStorage.getItem("lastPath") || "/";
          router.push(lastPath);
        } else {
          // Увеличиваем счетчик попыток
          setAttempts((prevAttempts) => {
            const newAttempts = prevAttempts + 1;
            localStorage.setItem("loginAttempts", newAttempts.toString());

            // Блокировка только на 5-й попытке (когда newAttempts === 5)
            if (newAttempts === 5) {
              const blockUntil = Date.now() + 30000; // 30 секунд
              localStorage.setItem("blockUntil", blockUntil.toString());
              setIsBlocked(true);
              setBlockTimeLeft(30);
            }

            return newAttempts;
          });

          // Анимация ошибки
          setIsShaking(true);
          setError(true);
          setTimeout(() => {
            setIsShaking(false);
            setPassword("");
            setError(false);
          }, 600);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [password, isBlocked, router]);

  const handleNumberClick = (num: string) => {
    if (isBlocked) return;
    if (password.length < 4) {
      setPassword(password + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    if (isBlocked) return;
    setPassword(password.slice(0, -1));
    setError(false);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 relative overflow-hidden flex items-center justify-center p-2 md:p-4">
      <StarsBackground />
      <SnowAnimation />

      <div className="relative w-full h-full max-w-sm md:max-w-2xl lg:max-w-4xl flex items-center justify-center">
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
          <GarlandLights />
          {/* Screen */}
          <div
            className="rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden relative flex flex-col flex-1"
            style={{
              background:
                "linear-gradient(to bottom, rgba(30, 58, 138, 0.7), rgba(30, 64, 175, 0.7), rgba(22, 101, 52, 0.7))",
              boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Системная строка */}
            <SystemStatusBar />

            {/* Контент авторизации */}
            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden px-4 py-6">
              {/* Скрытый input для предотвращения появления клавиатуры */}
              <input
                ref={inputRef}
                type="text"
                value={password}
                onChange={() => {}}
                className="absolute opacity-0 pointer-events-none"
                autoComplete="off"
                inputMode="none"
              />

              {/* Заголовок */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center mb-8"
              >
                <h1 className="text-2xl font-semibold text-white mb-2">
                  Рождественские Тайны
                </h1>
                <p className="text-white/70 text-sm">Введите пароль</p>
              </motion.div>

              {/* Отображение пароля - iOS стиль */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: isShaking ? [0, -10, 10, -10, 10, 0] : 0,
                }}
                transition={{
                  duration: 0.3,
                  delay: 0.1,
                  x: { duration: 0.6, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
                }}
                className="mb-8"
              >
                <div className="flex gap-3 items-center justify-center">
                  {[0, 1, 2, 3].map((index) => (
                    <motion.div
                      key={index}
                      animate={{
                        backgroundColor: error
                          ? "rgba(239, 68, 68, 0.8)"
                          : index < password.length
                          ? "rgba(255, 255, 255, 1)"
                          : "rgba(255, 255, 255, 0.3)",
                        borderColor: error
                          ? "rgba(239, 68, 68, 0.8)"
                          : "rgba(255, 255, 255, 0.5)",
                        scale: index < password.length ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`w-3 h-3 rounded-full border transition-all duration-200 ${
                        index < password.length ? "" : "border"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Сообщение о блокировке */}
              {isBlocked && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center mb-4"
                >
                  Попробуйте снова через {blockTimeLeft} сек.
                </motion.p>
              )}

              {/* Виртуальная клавиатура - iOS стиль */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="w-full max-w-[280px]"
              >
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <motion.button
                      key={num}
                      type="button"
                      onClick={() => handleNumberClick(num.toString())}
                      disabled={isBlocked}
                      whileHover={!isBlocked ? { scale: 1.08 } : {}}
                      whileTap={!isBlocked ? { scale: 0.92 } : {}}
                      className="aspect-square rounded-full text-white text-2xl font-light border border-white/30 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        background: isBlocked
                          ? "rgba(255, 255, 255, 0.03)"
                          : "rgba(255, 255, 255, 0.08)",
                        backdropFilter: "blur(20px)",
                        willChange: "transform",
                      }}
                    >
                      {num}
                    </motion.button>
                  ))}
                  {/* Пустая ячейка, 0, Backspace */}
                  <div />
                  <motion.button
                    type="button"
                    onClick={() => handleNumberClick("0")}
                    disabled={isBlocked}
                    whileHover={!isBlocked ? { scale: 1.08 } : {}}
                    whileTap={!isBlocked ? { scale: 0.92 } : {}}
                    className="aspect-square rounded-full text-white text-2xl font-light border border-white/30 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: isBlocked
                        ? "rgba(255, 255, 255, 0.03)"
                        : "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(20px)",
                      willChange: "transform",
                    }}
                  >
                    0
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleBackspace}
                    disabled={isBlocked}
                    whileHover={!isBlocked ? { scale: 1.08 } : {}}
                    whileTap={!isBlocked ? { scale: 0.92 } : {}}
                    className="aspect-square rounded-full text-white text-xl font-light border border-white/30 transition-all duration-150 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: isBlocked
                        ? "rgba(255, 255, 255, 0.03)"
                        : "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(20px)",
                      willChange: "transform",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Home Indicator */}
            <HomeIndicator />
          </div>
        </div>
      </div>
    </div>
  );
}
