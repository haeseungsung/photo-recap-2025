import { useState } from 'react'
import IntroSnowScene from './IntroSnowScene'
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
      {/* 2D Parallax Snow Globe */}
      <IntroSnowScene onStart={handleStart} />
    </div>
  )
}

export default IntroPage
