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
    name: "Библейские Цитаты",
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

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-2 md:px-4 relative z-10 overflow-visible">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="text-center mb-2 md:mb-3 flex-shrink-0"
        style={{ marginBottom: '40px' }}
      >
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 drop-shadow-2xl">
          Рождественские Тайны
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-white/80 text-xs md:text-sm"
        >
          Выберите игру
        </motion.p>
      </motion.div>

      {/* Grid с иконками - адаптивный: 2 столбца на мобильных, 3 на широких */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 w-full max-w-4xl flex-1 overflow-y-auto overflow-x-visible min-h-0 px-2 md:px-4 py-4 md:py-6 gap-4"
      >
        {rounds.map((round) => (
          <motion.div
            key={round.id}
            variants={cardVariants}
            whileHover={{
              scale: 1.05,
              y: -3,
              transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
            }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer relative flex flex-col items-center justify-start w-full z-10 hover:z-20"
            style={{ 
              willChange: "transform"
            }}
            onClick={() => router.push(`/round/${round.id}`)}
          >
            {/* App icon container - круглый */}
            <div
              className="rounded-full flex items-center justify-center relative overflow-hidden mb-2 flex-shrink-0"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                boxShadow:
                  "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                height: '96px',
                width: '96px'
              }}
            >
              {imageErrors[round.id] ? (
                <span className="text-2xl md:text-3xl lg:text-4xl">
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
                  style={{ width: '93px', height: '90px' }}
                />
              )}
            </div>

            {/* App name - текст под иконкой */}
            <h2 className="text-xs font-medium text-white leading-tight text-center mt-1 px-1 break-words">
              {round.name}
            </h2>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}
