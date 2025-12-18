"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import RoundSelector from "@/components/RoundSelector";
import SnowAnimation from "@/components/SnowAnimation";
import StarsBackground from "@/components/StarsBackground";
import SystemStatusBar from "@/components/SystemStatusBar";
import HomeIndicator from "@/components/HomeIndicator";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [lastPath, setLastPath] = useState<string>("/");

  useEffect(() => {
    // Загружаем последний путь
    const savedPath = localStorage.getItem("lastPath");
    if (savedPath) {
      setLastPath(savedPath);
    }

    // Сохраняем текущий путь
    if (pathname && pathname !== "/login") {
      localStorage.setItem("lastPath", pathname);
      setLastPath(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = localStorage.getItem("authenticated");
      if (authenticated === "true") {
        setIsAuthenticated(true);
        // Если авторизован, переходим на последний сохраненный путь
        if (lastPath && lastPath !== "/" && pathname === "/") {
          router.push(lastPath);
        }
      } else {
        setIsAuthenticated(false);
        router.push("/login");
      }
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router, lastPath, pathname]);

  // Показываем загрузку, пока проверяем аутентификацию
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 relative overflow-hidden flex items-center justify-center">
        <StarsBackground />
        <SnowAnimation />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-xl"
        >
          Загрузка...
        </motion.div>
      </div>
    );
  }

  // Если не авторизован, показываем ничего (редирект на /login)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 relative overflow-hidden flex items-center justify-center p-2 md:p-4">
      <StarsBackground />
      <SnowAnimation />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full h-full max-w-sm md:max-w-2xl lg:max-w-4xl relative flex items-center justify-center"
      >
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

            {/* Контент */}
            <div className="flex-1 flex items-center justify-center overflow-visible pt-8 md:pt-10 pb-10 md:pb-12">
              <RoundSelector />
            </div>

            {/* Home Indicator */}
            <HomeIndicator />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
