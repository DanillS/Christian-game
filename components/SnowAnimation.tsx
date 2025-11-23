'use client'

export default function SnowAnimation() {
  const snowflakes = Array.from({ length: 50 }, (_, i) => i)

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {snowflakes.map((flake) => (
        <div
          key={flake}
          className="absolute text-white text-2xl animate-snow"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
            opacity: 0.7 + Math.random() * 0.3,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  )
}

