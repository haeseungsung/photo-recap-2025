import { useState } from 'react'
import SnowGlobeSpec from './SnowGlobeSpec'
import '../styles/IntroPage.css'

function IntroPage({ onStart }) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleStart = () => {
    setIsAnimating(true)
    // Wait for fade-out animation to complete
    setTimeout(() => {
      onStart()
    }, 600)
  }

  return (
    <div className={`intro-page ${isAnimating ? 'fade-out' : ''}`}>
      {/* 3D Snow Globe */}
      <div className="intro-background">
        <SnowGlobeSpec />
      </div>

      {/* CTA Button overlay */}
      <div className="intro-cta-overlay">
        <button className="intro-cta-modern" onClick={handleStart}>
          <span className="intro-cta-text">시작하기</span>
        </button>
      </div>
    </div>
  )
}

export default IntroPage
