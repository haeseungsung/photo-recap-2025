import { useState, useEffect } from 'react'
import '../styles/IntroPage.css'

function IntroPage({ onStart }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [charFonts, setCharFonts] = useState({})

  const lines = [
    "What is the",
    "color of your",
    "2025"
  ]
  const fonts = ['text-serif', 'text-pixel', 'text-cursive']

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
