import { useState } from 'react'
import AuraBackground from './AuraBackground'
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
      {/* The pervasive background layer */}
      <AuraBackground />

      {/* Main Content */}
      <div className="intro-content">
        <h1 className="intro-title">
          What's the<br />
          color of your<br />
          2025?
        </h1>

        {/* CTA Button */}
        <button className="intro-cta" onClick={handleStart}>
          <span className="intro-cta-glow"></span>
          <span className="intro-cta-text">Find Out</span>
        </button>

        <p className="intro-footer">
          fire place. spark. wine. relax®
        </p>
      </div>
    </div>
  )
}

export default IntroPage
