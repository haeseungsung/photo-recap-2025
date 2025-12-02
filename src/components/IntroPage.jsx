import { useState } from 'react'
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
      {/* Gradient Background with Noise Texture */}
      <div className="intro-background">
        <div className="gradient-layer"></div>
        <div className="noise-layer"></div>
      </div>

      {/* Main Content */}
      <div className="intro-content">
        {/* Typography with Mixed Fonts */}
        <h1 className="intro-title">
          <span className="text-serif">What is the</span>
          <span className="text-pixel">color of your</span>
          <span className="text-cursive">2025</span>
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
