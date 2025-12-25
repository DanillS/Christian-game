'use client'

export default function FrostEffect() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 0% 100%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
        `,
        animation: 'frost 4s ease-in-out infinite',
        willChange: 'opacity',
      }}
    />
  )
}









