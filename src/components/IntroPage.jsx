import { useState, useEffect, useRef } from 'react'
import '../styles/IntroPage.css'

function IntroPage({ onStart }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [fontVariant, setFontVariant] = useState(0)
  const fileInputRef = useRef(null)

  // 폰트 변경 애니메이션 (0.2초마다 변경)
  useEffect(() => {
    const fontInterval = setInterval(() => {
      setFontVariant(prev => (prev + 1) % 3)
    }, 200)

    return () => clearInterval(fontInterval)
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

  // 폰트 스타일 조합 (3가지 패턴을 순환)
  const getFontClass = (index) => {
    const patterns = [
      ['text-serif', 'text-pixel', 'text-cursive'],
      ['text-cursive', 'text-serif', 'text-pixel'],
      ['text-pixel', 'text-cursive', 'text-serif']
    ]
    return patterns[fontVariant][index]
  }

  return (
    <div className={`intro-page ${isAnimating ? 'fade-out' : ''}`}>
      {/* Gradient Background with Noise Texture */}
      <div className="intro-background">
        <div className="gradient-layer"></div>
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
        {/* Typography with Mixed Fonts */}
        <h1 className="intro-title">
          <span className={`${getFontClass(0)} font-transition`}>What is the</span>
          <span className={`${getFontClass(1)} font-transition`}>color of your</span>
          <span className={`${getFontClass(2)} font-transition`}>2025</span>
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
