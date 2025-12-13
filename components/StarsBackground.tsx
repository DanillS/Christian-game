"use client";

import { useState, useEffect } from "react";

export default function StarsBackground() {
  const [stars, setStars] = useState<
    Array<{ left: number; top: number; delay: number }>
  >([]);

  useEffect(() => {
    // Генерируем позиции звезд только на клиенте, чтобы избежать ошибок гидратации
    const starsData = Array.from({ length: 30 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setStars(starsData);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute text-yellow-300 text-xl animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.delay}s`,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
}
