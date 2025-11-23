'use client'

export default function StarsBackground() {
  const stars = Array.from({ length: 30 }, (_, i) => i)

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star}
          className="absolute text-yellow-300 text-xl animate-twinkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  )
}

