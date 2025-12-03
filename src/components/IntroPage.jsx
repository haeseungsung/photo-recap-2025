import { useState, useEffect, useRef } from 'react'
import '../styles/IntroPage.css'

function IntroPage({ onStart }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [charFonts, setCharFonts] = useState({})
  const [fallingEmojis, setFallingEmojis] = useState([])
  const emojiIdCounter = useRef(0)

  const lines = [
    "What is the",
    "color of your",
    "2025"
  ]
  const fonts = ['text-serif', 'text-pixel', 'text-cursive']
  const emojiList = ['✨', '💫', '⭐', '🌟', '💖', '💕', '🌈', '🎨', '🎵', '🌸', '🌺', '🦋', '🎀', '🌙', '☀️']

  // 각 알파벳마다 랜덤하게 폰트 변경 애니메이션
  useEffect(() => {
    // 모든 텍스트를 합쳐서 인덱스 계산
    const allText = lines.join('')
    const initialFonts = {}
    for (let i = 0; i < allText.length; i++) {
      initialFonts[i] = fonts[Math.floor(Math.random() * fonts.length)]
    }
    setCharFonts(initialFonts)

    // 각 글자마다 다른 타이밍으로 폰트 변경
    const intervals = []
    for (let i = 0; i < allText.length; i++) {
      const interval = setInterval(() => {
        setCharFonts(prev => ({
          ...prev,
          [i]: fonts[Math.floor(Math.random() * fonts.length)]
        }))
      }, 600 + (i * 90)) // 각 글자마다 약간씩 다른 간격 (3배 느리게)
      intervals.push(interval)
    }

    return () => intervals.forEach(clearInterval)
  }, [])

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
      {/* Gradient Background with Noise Texture */}
      <div className="intro-background">
        <div className="gradient-layer"></div>
        <div className="watercolor-texture"></div>
        <div className="noise-layer"></div>
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
        {/* Typography with Mixed Fonts - 각 글자마다 다른 폰트 */}
        <h1 className="intro-title">
          {lines.map((line, lineIndex) => {
            // 이전 줄들의 글자 수를 합산하여 현재 줄의 시작 인덱스 계산
            const startIndex = lines.slice(0, lineIndex).join('').length

            return (
              <div key={lineIndex} className="title-line">
                {line.split('').map((char, charIndex) => {
                  const globalIndex = startIndex + charIndex
                  return (
                    <span
                      key={charIndex}
                      className={`${charFonts[globalIndex] || fonts[0]} char-animation`}
                      style={{
                        display: char === ' ' ? 'inline' : 'inline-block',
                        marginRight: char === ' ' ? '0.3em' : '0'
                      }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  )
                })}
              </div>
            )
          })}
        </h1>

        {/* CTA Button */}
        <button className="intro-cta" onClick={handleStart}>
          Find Out
        </button>
      </div>
    </div>
  )
}

export default IntroPage
