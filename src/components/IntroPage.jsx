import { useState, useEffect, useRef } from 'react'
import '../styles/IntroPage.css'

function IntroPage({ onStart }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [charFonts, setCharFonts] = useState({})
  const fileInputRef = useRef(null)

  const text = "What is the color of your 2025"
  const fonts = ['text-serif', 'text-pixel', 'text-cursive']

  // 각 알파벳마다 랜덤하게 폰트 변경 애니메이션
  useEffect(() => {
    // 초기 랜덤 폰트 설정
    const initialFonts = {}
    for (let i = 0; i < text.length; i++) {
      initialFonts[i] = fonts[Math.floor(Math.random() * fonts.length)]
    }
    setCharFonts(initialFonts)

    // 각 글자마다 다른 타이밍으로 폰트 변경
    const intervals = []
    for (let i = 0; i < text.length; i++) {
      const interval = setInterval(() => {
        setCharFonts(prev => ({
          ...prev,
          [i]: fonts[Math.floor(Math.random() * fonts.length)]
        }))
      }, 200 + (i * 30)) // 각 글자마다 약간씩 다른 간격
      intervals.push(interval)
    }

    return () => intervals.forEach(clearInterval)
  }, [])

  const handleStart = () => {
    // 바로 파일 선택 다이얼로그 열기
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setIsAnimating(true)
      // Wait for fade-out animation to complete
      setTimeout(() => {
        onStart(files)
      }, 600)
    }
  }

  return (
    <div className={`intro-page ${isAnimating ? 'fade-out' : ''}`}>
      {/* Gradient Background with Noise Texture */}
      <div className="intro-background">
        <div className="gradient-layer"></div>
        <div className="watercolor-texture"></div>
        <div className="noise-layer"></div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Main Content */}
      <div className="intro-content">
        {/* Typography with Mixed Fonts - 각 글자마다 다른 폰트 */}
        <h1 className="intro-title">
          {text.split('').map((char, index) => (
            <span
              key={index}
              className={`${charFonts[index] || fonts[0]} char-animation`}
              style={{
                display: char === ' ' ? 'inline' : 'inline-block',
                marginRight: char === ' ' ? '0.3em' : '0'
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
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
