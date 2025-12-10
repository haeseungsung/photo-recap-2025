import { useEffect, useState } from 'react'
import '../styles/IntroPage.css'

const AuraBackground = () => {
  const [trailPoints, setTrailPoints] = useState([])
  const [stars, setStars] = useState([])

  // Initialize and regenerate stars
  useEffect(() => {
    const generateStar = () => ({
      id: Math.random(),
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      scale: 0.5 + Math.random() * 0.5,
      animationDuration: `${2 + Math.random() * 3}s`
    })

    // Initial stars
    setStars(Array.from({ length: 20 }).map(generateStar))

    // Periodically add new stars to keep the twinkling effect if CSS is 'forwards'
    // But since we want a continuous background, let's just use the existing CSS
    // and maybe update the CSS to be infinite in a separate step if needed.
    // For now, let's assume the CSS might be 'forwards' but we want them to persist?
    // Actually, let's just render them. If they disappear, I'll fix the CSS.

    const interval = setInterval(() => {
      setStars(prev => {
        // Keep some, add some new ones to simulate continuous twinkling
        const kept = prev.filter(() => Math.random() > 0.3);
        const added = Array.from({ length: 5 }).map(generateStar);
        return [...kept, ...added].slice(0, 30);
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Handle mouse move for watercolor trail
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Generate multiple small stars for a "galaxy" effect
      const newStars = Array.from({ length: 3 }).map(() => ({
        id: Math.random(),
        x: e.clientX + (Math.random() - 0.5) * 40, // Spread around cursor
        y: e.clientY + (Math.random() - 0.5) * 40,
        size: Math.random() * 3 + 1, // 1px to 4px
        opacity: Math.random() * 0.5 + 0.5,
        animationDuration: Math.random() * 1000 + 500 // 0.5s to 1.5s
      }))

      setTrailPoints(prev => [...prev, ...newStars])

      // Cleanup stars after their max animation duration
      setTimeout(() => {
        const idsToRemove = newStars.map(s => s.id)
        setTrailPoints(prev => prev.filter(p => !idsToRemove.includes(p.id)))
      }, 1500)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="aura-background">
      {/* 1. Base Gradient Layer */}
      <div className="gradient-layer">
        <div className="gradient-blob gradient-blob-1"></div>
        <div className="gradient-blob gradient-blob-2"></div>
        <div className="gradient-blob gradient-blob-3"></div>
        <div className="gradient-blob gradient-blob-4"></div>
      </div>

      {/* 2. Galaxy Trail Layer */}
      <div className="watercolor-trail-container">
        {trailPoints.map(star => (
          <div
            key={star.id}
            className="trail-star"
            style={{
              left: star.x,
              top: star.y,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDuration: `${star.animationDuration}ms`
            }}
          />
        ))}
      </div>

      {/* 3. Grain Overlay - Adding a noise SVG as background */}
      <div className="grain-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
      }}>
        <div className="grain-static"></div>
        <div className="grain-animated"></div>
      </div>

      {/* 4. Stars Layer */}
      {stars.map(star => (
        <div
          key={star.id}
          className="star-container"
          style={{
            top: star.top,
            left: star.left,
            width: '24px',
            height: '24px',
            animationDuration: star.animationDuration,
            transform: `scale(${star.scale})`
          }}
        >
          <div className="star-glow"></div>
          <svg viewBox="0 0 24 24" className="star-svg" fill="white">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
      ))}
    </div>
  )
}

export default AuraBackground
