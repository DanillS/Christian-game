"use client";

import { useEffect, useState, useCallback } from "react";

export default function ParallaxBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Оптимизированный обработчик с debounce через requestAnimationFrame
  const handleMouseMove = useCallback((e: MouseEvent) => {
    requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    });
  }, []);

  useEffect(() => {
    // Добавляем обработчик только на десктопе/планшете
    // Проверяем наличие window для SSR
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [handleMouseMove]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background:
          "linear-gradient(to bottom, rgba(30, 58, 138, 0.7), rgba(30, 64, 175, 0.7), rgba(22, 101, 52, 0.7))",
        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
        willChange: "transform",
        transition: "transform 0.1s ease-out",
      }}
    />
  );
}
