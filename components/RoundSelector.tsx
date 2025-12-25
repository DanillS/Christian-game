"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const rounds = [
  {
    id: "guess-face",
    name: "Угадай Лицо",
    description: "Угадай по фрагментам",
    icon: "/icons/guess-face",
    emoji: "👤",
  },
  {
    id: "bible-quotes",
    name: "Библейские Вопросы",
    description: "Продолжи цитату",
    icon: "/icons/bible-quotes",
    emoji: "📖",
  },
  {
    id: "guess-voice",
    name: "Угадай, Кто Говорит",
    description: "Узнай голос",
    icon: "/icons/guess-voice",
    emoji: "🎤",
  },
];

// Умный компонент для загрузки иконок с поддержкой форматов
function SmartRoundIcon({
  roundId,
  customIcon,
  defaultIcon,
  emoji,
  alt,
  onError,
  ...props
}: {
  roundId: string;
  customIcon?: string;
  defaultIcon: string;
  emoji: string;
  alt: string;
  onError: () => void;
  [key: string]: any;
}) {
  const formats = [".png", ".jpg", ".jpeg", ".webp"];
  const [currentSrc, setCurrentSrc] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (customIcon) {
      setCurrentSrc(customIcon);
      setHasError(false);
    } else {
      setCurrentSrc(`${defaultIcon}${formats[0]}`);
      setHasError(false);
    }
  }, [customIcon, defaultIcon]);

  const handleError = () => {
    if (customIcon && attempt === 0) {
      setCurrentSrc(`${defaultIcon}${formats[0]}`);
      setAttempt(1);
    } else if (attempt < formats.length - 1) {
      setCurrentSrc(`${defaultIcon}${formats[attempt + 1]}`);
      setAttempt(attempt + 1);
    } else {
      setHasError(true);
      onError();
    }
  };

  if (hasError || !currentSrc) {
    return <span className="text-2xl md:text-3xl lg:text-4xl">{emoji}</span>;
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={96}
      height={96}
      className="object-cover w-full h-full rounded-full"
      unoptimized
      priority={false}
      loading="lazy"
      onError={handleError}
      {...props}
    />
  );
}

export default function RoundSelector() {
  const router = useRouter();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [customIcons, setCustomIcons] = useState<Record<string, string>>({});

  useEffect(() => {
    let ignore = false;

    const loadIcons = async () => {
      const cacheKey = "round-icons-cache";
      const cacheTimestampKey = "round-icons-cache-timestamp";
      const cachedIcons = sessionStorage.getItem(cacheKey);
      const cacheTimestamp = sessionStorage.getItem(cacheTimestampKey);

      const CACHE_DURATION = 60 * 60 * 1000;
      const now = Date.now();

      if (cachedIcons && cacheTimestamp) {
        const timestamp = parseInt(cacheTimestamp, 10);
        if (now - timestamp < CACHE_DURATION) {
          try {
            const icons = JSON.parse(cachedIcons);
            if (!ignore) {
              setCustomIcons(icons);
            }
            return;
          } catch (e) {
            sessionStorage.removeItem(cacheKey);
            sessionStorage.removeItem(cacheTimestampKey);
          }
        }
      }

      try {
        const response = await fetch("/api/round-icons", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json();

        if (!ignore && payload?.icons) {
          setCustomIcons(payload.icons);
          sessionStorage.setItem(cacheKey, JSON.stringify(payload.icons));
          sessionStorage.setItem(cacheTimestampKey, now.toString());
        }
      } catch (error) {
        console.error("[RoundSelector] Не удалось загрузить иконки", error);
      }
    };

    loadIcons();

    return () => {
      ignore = true;
    };
  }, []);

  const handleImageError = (roundId: string) => {
    setImageErrors((prev) => ({ ...prev, [roundId]: true }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
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

  // Обработчик клика с эффектом волны
  const handleCardClick = (
    roundId: string,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const card = event.currentTarget;
    const ripple = document.createElement("div");
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
      animation: ripple 0.6s ease-out;
      will-change: transform, opacity;
      z-index: 1;
    `;

    card.style.position = "relative";
    card.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
      router.push(`/round/${roundId}`);
    }, 300);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-start px-2 md:px-4 relative z-10 overflow-visible pt-4 md:pt-6 lg:pt-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="text-center flex-shrink-0 mb-12 md:mb-14 lg:mb-16"
      >
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 drop-shadow-2xl pulse-glow">
          Рождественские Тайны
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-white/80 text-xs md:text-sm fade-in-out"
        >
          Выберите игру
        </motion.p>
      </motion.div>

      {/* Равномерное расположение иконок */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center w-full max-w-4xl overflow-visible px-2 md:px-4 py-2 md:py-4 pb-12 md:pb-16 lg:pb-20"
      >
        {/* Верхний ряд: 2 иконки с равномерным распределением */}
        <div className="flex items-center justify-evenly w-full mb-6 md:mb-8 lg:mb-10">
          {rounds
            .filter((r) => r.id !== "bible-quotes")
            .map((round) => (
              <motion.div
                key={round.id}
                variants={cardVariants}
                whileHover={{
                  scale: 1.05,
                  y: -3,
                  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer relative flex flex-col items-center justify-center z-10 hover:z-20 float-animation"
                style={{
                  willChange: "transform",
                }}
                onClick={(e) => handleCardClick(round.id, e)}
              >
                {/* App icon container - круглый, одинакового размера */}
                <div
                  className="rounded-full flex items-center justify-center relative overflow-hidden mb-2 md:mb-3 flex-shrink-0 golden-glow deep-shadow"
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    height: "120px",
                    width: "120px",
                    transition: "box-shadow 0.3s ease",
                  }}
                >
                  {imageErrors[round.id] ? (
                    <span className="text-3xl md:text-4xl lg:text-5xl">
                      {round.emoji}
                    </span>
                  ) : (
                    <SmartRoundIcon
                      roundId={round.id}
                      customIcon={customIcons[round.id]}
                      defaultIcon={round.icon}
                      emoji={round.emoji}
                      alt={round.name}
                      onError={() => handleImageError(round.id)}
                      className="object-cover rounded-full"
                      style={{ width: "116px", height: "116px" }}
                    />
                  )}
                </div>

                {/* App name - текст под иконкой */}
                <h2 className="text-sm md:text-base font-medium text-white leading-tight text-center mt-1 px-1 break-words">
                  {round.name}
                </h2>
              </motion.div>
            ))}
        </div>

        {/* Нижний ряд: 1 иконка по центру (Библейские Вопросы) */}
        <div className="flex items-center justify-center w-full">
          {rounds
            .filter((r) => r.id === "bible-quotes")
            .map((round) => (
              <motion.div
                key={round.id}
                variants={cardVariants}
                whileHover={{
                  scale: 1.05,
                  y: -3,
                  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer relative flex flex-col items-center justify-center z-10 hover:z-20 float-animation"
                style={{
                  willChange: "transform",
                }}
                onClick={(e) => handleCardClick(round.id, e)}
              >
                {/* App icon container - круглый, одинакового размера */}
                <div
                  className="rounded-full flex items-center justify-center relative overflow-hidden mb-2 md:mb-3 flex-shrink-0 golden-glow deep-shadow"
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    height: "120px",
                    width: "120px",
                    transition: "box-shadow 0.3s ease",
                  }}
                >
                  {imageErrors[round.id] ? (
                    <span className="text-3xl md:text-4xl lg:text-5xl">
                      {round.emoji}
                    </span>
                  ) : (
                    <SmartRoundIcon
                      roundId={round.id}
                      customIcon={customIcons[round.id]}
                      defaultIcon={round.icon}
                      emoji={round.emoji}
                      alt={round.name}
                      onError={() => handleImageError(round.id)}
                      className="object-cover rounded-full"
                      style={{ width: "116px", height: "116px" }}
                    />
                  )}
                </div>

                {/* App name - текст под иконкой */}
                <h2 className="text-sm md:text-base font-medium text-white leading-tight text-center mt-1 px-1 break-words">
                  {round.name}
                </h2>
              </motion.div>
            ))}
        </div>
      </motion.div>
    </div>
  );
}
