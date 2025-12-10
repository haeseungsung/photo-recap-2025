// src/components/IntroSnowScene.jsx
import { useEffect, useRef } from 'react'
import '../styles/IntroSnowScene.css'

function applyParallax(el, x, y, strength) {
  if (!el) return
  const tx = x * strength
  const ty = y * strength
  el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`
}

export default function IntroSnowScene({ onStart }) {
  const rootRef = useRef(null)
  const bgRef = useRef(null)
  const globeRef = useRef(null)
  const highlightRef = useRef(null)
  const overlayRef = useRef(null)
  const canvasRef = useRef(null)

  // 패럴랙스: 포인터 움직임에 따라 레이어 위치를 조금씩 바꾸기
  const handlePointerMove = (e) => {
    const root = rootRef.current
    if (!root) return

    const rect = root.getBoundingClientRect()
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX)
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY)
    if (clientX == null || clientY == null) return

    const nx = (clientX - rect.left) / rect.width - 0.5 // -0.5 ~ 0.5
    const ny = (clientY - rect.top) / rect.height - 0.5

    const x = nx * 2 // -1 ~ 1
    const y = ny * 2

    applyParallax(bgRef.current, x, y, 10)        // 가장 뒤
    applyParallax(globeRef.current, x, y, 18)     // 본체
    applyParallax(highlightRef.current, x, y, 24) // 유리 하이라이트
    applyParallax(overlayRef.current, x, y, 6)    // 텍스트/버튼
  }

  const handlePointerLeave = () => {
    [bgRef, globeRef, highlightRef, overlayRef].forEach((r) => {
      if (r.current) {
        r.current.style.transform = 'translate3d(0, 0, 0)'
      }
    })
  }

  // 눈 파티클 캔버스
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.clientWidth
    let height = canvas.clientHeight
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // 매번 리셋 + 스케일
    }

    resize()
    window.addEventListener('resize', resize)

    // 배경 눈 파티클 (작고 반짝이는 별처럼)
    const bgParticleCount = 150
    const bgParticles = []

    // 글로브 안 눈 파티클
    const globeParticleCount = 200
    const globeParticles = []

    // 스노우글로브 원형 영역 계산
    const getGlobeInfo = () => {
      // CSS에서 min(136vw, 720px), max-width: 840px
      const vwSize = width * 1.36
      const imgWidth = Math.min(vwSize, 720, 840)

      // 이미지 비율: 1200 x 673
      const imgHeight = imgWidth * (673 / 1200)

      // 글로브 원형은 이미지 상단 중앙에 위치
      // 실제 글로브 원의 지름은 대략 이미지 width의 60% 정도
      const globeDiameter = imgWidth * 0.5
      const globeRadius = globeDiameter / 2

      // 글로브 중심 위치 (화면 중앙보다 약간 위)
      const centerX = width / 2
      const centerY = height / 2 - imgHeight * 0.08 // 약간 위로

      return { radius: globeRadius, centerX, centerY }
    }

    const initParticles = () => {
      bgParticles.length = 0
      globeParticles.length = 0

      const { radius: globeRadius, centerX, centerY } = getGlobeInfo()

      // 배경 눈 파티클 초기화 (화면 전체)
      for (let i = 0; i < bgParticleCount; i++) {
        bgParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.8 + Math.random() * 1.5, // 작은 크기
          vy: 0.3 + Math.random() * 0.8, // 느린 속도
          vx: -0.2 + Math.random() * 0.4,
          alpha: 0.4 + Math.random() * 0.3, // 60% 정도 투명도
          twinkle: Math.random() * Math.PI * 2, // 반짝임 효과용
        })
      }

      // 글로브 안 눈 파티클 초기화 (원형 영역)
      for (let i = 0; i < globeParticleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const r = Math.sqrt(Math.random()) * globeRadius * 0.85
        const x = centerX + r * Math.cos(angle)
        const y = centerY + r * Math.sin(angle) - globeRadius * 0.2

        globeParticles.push({
          x,
          y,
          r: 1.5 + Math.random() * 2.5,
          vy: 0.5 + Math.random() * 1.2,
          vx: -0.3 + Math.random() * 0.6,
          alpha: 0.3, // 30% 불투명
        })
      }
    }

    initParticles()

    let frameId

    let time = 0
    const render = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      ctx.fillStyle = '#ffffff'

      const { radius: globeRadius, centerX, centerY } = getGlobeInfo()
      time += 0.016 // ~60fps

      // 1. 배경 눈 파티클 그리기 (반짝임 효과)
      for (let i = 0; i < bgParticles.length; i++) {
        const p = bgParticles[i]
        p.x += p.vx
        p.y += p.vy

        // 화면 밖으로 나가면 위쪽에서 다시 시작
        if (p.y - p.r > height) {
          p.y = -p.r
          p.x = Math.random() * width
        }
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10

        // 반짝임 효과 (별처럼)
        p.twinkle += 0.05
        const twinkleAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.twinkle))

        ctx.globalAlpha = twinkleAlpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // 2. 글로브 안 눈 파티클 그리기
      for (let i = 0; i < globeParticles.length; i++) {
        const p = globeParticles[i]
        p.x += p.vx
        p.y += p.vy

        // 원의 중심으로부터의 거리 계산
        const dx = p.x - centerX
        const dy = p.y - centerY
        const distFromCenter = Math.sqrt(dx * dx + dy * dy)

        // 원형 영역 밖으로 나가면 위쪽에서 다시 시작
        if (distFromCenter > globeRadius * 0.85 || p.y > centerY + globeRadius * 0.8) {
          const angle = Math.random() * Math.PI * 2
          const r = Math.sqrt(Math.random()) * globeRadius * 0.75
          p.x = centerX + r * Math.cos(angle)
          p.y = centerY - globeRadius * 0.8 // 위쪽에서 다시 시작
        }

        ctx.globalAlpha = p.alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
      frameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className="intro-snow-root"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onTouchMove={handlePointerMove}
    >
      {/* 뒤 배경 레이어 */}
      <div ref={bgRef} className="intro-layer intro-bg-layer" />

      {/* 스노우글로브 본체 레이어 */}
      <div ref={globeRef} className="intro-layer intro-globe-layer">
        <img
          src="/images/globe-inner.png"
          alt="Snow globe"
          className="intro-globe-inner"
        />
      </div>

      {/* 유리 하이라이트 레이어 */}
      <div ref={highlightRef} className="intro-layer intro-highlight-layer">
        <img
          src="/images/globe-highlight.png"
          alt=""
          className="intro-glass-highlight"
        />
      </div>

      {/* 눈 파티클 캔버스 */}
      <canvas ref={canvasRef} className="intro-snow-canvas" />

      {/* 텍스트 & 버튼 */}
      <div ref={overlayRef} className="intro-overlay">
        <p className="intro-subtitle">Your year in colors</p>
        <h1 className="intro-title">2025 Recap</h1>
        <p className="intro-desc">
          당신의 사진 30장을 분석해서
          <br />
          올해를 대표하는 컬러 팔레트를 만들어줄게요.
        </p>
        <button
          className="intro-cta"
          onClick={onStart}
          type="button"
        >
          시작하기
        </button>
      </div>

      {/* 아래 작은 힌트 */}
      <div className="intro-hint">
        화면을 살짝 움직여보세요 ✨
      </div>
    </div>
  )
}
