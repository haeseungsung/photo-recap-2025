import { useState, useEffect, useRef } from 'react'
import '../styles/IntroPage.css'

function IntroPage({ onStart }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [fallingEmojis, setFallingEmojis] = useState([])
  const emojiIdCounter = useRef(0)

  const emojiList = ['✨', '💫', '⭐', '🌟', '💖', '💕', '🌈', '🎨', '🎵', '🌸', '🌺', '🦋', '🎀', '🌙', '☀️']

  // 이모지 계속 생성 및 쌓기
  useEffect(() => {
    const createEmoji = () => {
      const emoji = emojiList[Math.floor(Math.random() * emojiList.length)]
      const left = Math.random() * 100 // 0-100%
      const duration = 7 + Math.random() * 2.5 // 7-9.5초
      const id = emojiIdCounter.current++

      setFallingEmojis(prev => [...prev, {
        id,
        emoji,
        left,
        duration
      }])

      // 애니메이션 완료 후 이모지 제거 (메모리 관리)
      // 최대 50개까지만 유지
      setTimeout(() => {
        setFallingEmojis(prev => {
          if (prev.length > 50) {
            return prev.slice(-50)
          }
          return prev
        })
      }, duration * 1000)
    }

    // 초기 이모지 생성
    for (let i = 0; i < 10; i++) {
      setTimeout(() => createEmoji(), i * 300)
    }

    // 계속해서 새로운 이모지 생성 (0.8초마다)
    const interval = setInterval(createEmoji, 800)

    return () => clearInterval(interval)
  }, [])

  const handleStart = () => {
    setIsAnimating(true)
    // Wait for fade-out animation to complete
    setTimeout(() => {
      onStart()
    }, 600)
  }

  return (
    <div className={`intro-page ${isAnimating ? 'fade-out' : ''}`}>
      {/* Background Layers */}
      <div className="intro-background">
        <div className="sparkle-layer">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="sparkle"></div>
          ))}
        </div>
        <div className="emoji-layer">
          {fallingEmojis.map((item) => (
            <div
              key={item.id}
              className="falling-emoji-dynamic"
              style={{
                left: `${item.left}%`,
                animationDuration: `${item.duration}s`
              }}
            >
              {item.emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="intro-content">
        <h1 className="intro-title">
          당신의<br />
          2025년은<br />
          어떤 색인가요?
        </h1>

        {/* CTA Button */}
        <button className="intro-cta" onClick={handleStart}>
          알아보기
        </button>
      </div>
    </div>
  )
}

export default IntroPage
