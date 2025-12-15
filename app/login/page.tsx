"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SnowAnimation from "@/components/SnowAnimation";
import StarsBackground from "@/components/StarsBackground";
import SystemStatusBar from "@/components/SystemStatusBar";
import HomeIndicator from "@/components/HomeIndicator";

const PASSWORD = "1996"; // Пароль можно изменить здесь

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      localStorage.setItem("authenticated", "true");
      const lastPath = localStorage.getItem("lastPath") || "/";
      router.push(lastPath);
    } else {
      setError("Неверный пароль");
      setPassword("");
    }
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
            <div className="flex-1 flex items-center justify-center overflow-hidden pt-10 md:pt-12 pb-12 md:pb-14 px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-3xl p-6 md:p-8 w-full max-w-md"
                style={{
                  background: "rgba(255, 255, 255, 0.25)",
                  backdropFilter: "blur(30px)",
                  WebkitBackdropFilter: "blur(30px)",
                  border: "1px solid rgba(255, 204, 0, 0.4)",
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 204, 0, 0.2)",
                }}
              >
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5 md:mb-2 text-center">
                  Рождественские Тайны
                </h1>
                <p className="text-white/80 text-center mb-4 md:mb-6 text-sm md:text-base">
                  Введите пароль для входа
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Пароль"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md text-white placeholder-white/60 border-2 border-white/20 focus:border-yellow-400/70 focus:outline-none transition-all"
                      style={{
                        boxShadow: "0 4px 15px rgba(234, 179, 8, 0.1)",
                      }}
                      autoFocus
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-xl"
                      style={{
                        willChange: "transform",
                      }}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </motion.button>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full text-white font-semibold py-3 rounded-xl backdrop-blur-xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.25)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                      willChange: "transform",
                    }}
                  >
                    Войти
                  </motion.button>
                </form>
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
