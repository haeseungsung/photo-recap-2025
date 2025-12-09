import { useState, useEffect, useRef } from 'react'
import '../styles/IntroPage.css'

function IntroPage({ onStart }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [typedText, setTypedText] = useState(['', '', ''])
  const [stickerNumbers, setStickerNumbers] = useState({
    2: 1,
    '2_second': 1,
    0: 1,
    5: 1
  })
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: null, y: null })
  const animationFrameRef = useRef(null)

  const fullText = ['당신의', '2025', '컬러는?']

  // Random sticker selection on mount
  useEffect(() => {
    const number2Count = 6 // number2-1 to number2-6
    const number0Count = 4 // number0-1 to number0-4
    const number5Count = 4 // number5-1 to number5-4

    const first2 = Math.floor(Math.random() * number2Count) + 1
    let second2 = Math.floor(Math.random() * number2Count) + 1

    // Ensure second 2 is different from first 2
    while (second2 === first2) {
      second2 = Math.floor(Math.random() * number2Count) + 1
    }

    setStickerNumbers({
      2: first2,
      '2_second': second2,
      0: Math.floor(Math.random() * number0Count) + 1,
      5: Math.floor(Math.random() * number5Count) + 1
    })
  }, [])

  // Pantone 2025 colors from loading page
  const colors = [
    '#BB2649', '#6667AB', '#F5DF4D', '#939597', '#0F4C81',
    '#FF6F61', '#5F4B8B', '#88B04B', '#F7CAC9', '#92A8D1',
    '#955251', '#B565A7', '#009B77', '#DD4124', '#D94F70',
    '#483C56', '#38929A', '#E9D843', '#E57C6C', '#9E2B25'
  ]

  // Typing animation effect
  useEffect(() => {
    let currentLine = 0
    let currentChar = 0
    let timeoutId

    const typeNextChar = () => {
      if (currentLine >= fullText.length) return

      const line = fullText[currentLine]

      if (currentChar < line.length) {
        setTypedText(prev => {
          const newText = [...prev]
          newText[currentLine] = line.substring(0, currentChar + 1)
          return newText
        })
        currentChar++
        timeoutId = setTimeout(typeNextChar, 100)
      } else {
        // Move to next line
        currentLine++
        currentChar = 0
        if (currentLine < fullText.length) {
          timeoutId = setTimeout(typeNextChar, 200)
        }
      }
    }

    timeoutId = setTimeout(typeNextChar, 500)

    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const particleCount = 100
    const maxDistance = 120
    const mouseRadius = 150

    // Canvas resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          color: colors[Math.floor(Math.random() * colors.length)]
        })
      }
    }

    // Mouse/Touch handlers
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX
        mouseRef.current.y = e.touches[0].clientY
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = null
      mouseRef.current.y = null
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Mouse attraction
        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dx = mouseRef.current.x - particle.x
          const dy = mouseRef.current.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < mouseRadius) {
            const force = (mouseRadius - distance) / mouseRadius
            particle.vx += (dx / distance) * force * 0.05
            particle.vy += (dy / distance) * force * 0.05
          }
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Apply friction
        particle.vx *= 0.98
        particle.vy *= 0.98

        // Add random drift
        particle.vx += (Math.random() - 0.5) * 0.05
        particle.vy += (Math.random() - 0.5) * 0.05

        // Limit velocity
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
        if (speed > 2) {
          particle.vx = (particle.vx / speed) * 2
          particle.vy = (particle.vy / speed) * 2
        }

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particle.x
          const dy = particles[j].y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            ctx.beginPath()
            ctx.strokeStyle = particle.color
            ctx.globalAlpha = (1 - distance / maxDistance) * 0.3
            ctx.lineWidth = 1
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }

        // Draw particle with glow effect
        // Outer glow
        ctx.beginPath()
        ctx.fillStyle = particle.color
        ctx.globalAlpha = 0.2
        ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2)
        ctx.fill()

        // Inner glow
        ctx.beginPath()
        ctx.fillStyle = particle.color
        ctx.globalAlpha = 0.4
        ctx.arc(particle.x, particle.y, particle.radius * 1.5, 0, Math.PI * 2)
        ctx.fill()

        // Core particle
        ctx.beginPath()
        ctx.fillStyle = particle.color
        ctx.globalAlpha = 0.8
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.globalAlpha = 1
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Initialize
    resizeCanvas()
    initParticles()
    animate()

    // Event listeners
    window.addEventListener('resize', () => {
      resizeCanvas()
      initParticles()
    })
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  const handleStart = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onStart()
    }, 600)
  }

  return (
    <div className={`intro-page-typo ${isAnimating ? 'fade-out' : ''}`}>
      <canvas ref={canvasRef} className="plexus-canvas" />

      <div className="typo-container">
        <h1 className="typo-main">
          <span className="typo-line">{typedText[0]}<span className="cursor">{typedText[0].length < fullText[0].length ? '|' : ''}</span></span>
          <span className="typo-line typo-line-right sticker-line">
            {typedText[1] && (
              <span className="sticker-year">
                <img src={`/images/number2-${stickerNumbers[2]}.png`} alt="2" className="sticker-digit" />
                <img src={`/images/number0-${stickerNumbers[0]}.png`} alt="0" className="sticker-digit" />
                <img src={`/images/number2-${stickerNumbers['2_second']}.png`} alt="2" className="sticker-digit" />
                <img src={`/images/number5-${stickerNumbers[5]}.png`} alt="5" className="sticker-digit" />
              </span>
            )}
            <span className="cursor">{typedText[1].length < fullText[1].length ? '|' : ''}</span>
          </span>
          <span className="typo-line">{typedText[2]}<span className="cursor">{typedText[2].length < fullText[2].length ? '|' : ''}</span></span>
        </h1>
        <p className="typo-subtitle">Find out your 2025 color palette</p>
      </div>

      <button className="typo-cta" onClick={handleStart}>
        시작하기
      </button>
    </div>
  )
}

export default IntroPage
