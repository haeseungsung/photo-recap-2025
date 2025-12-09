import { useState, useEffect } from 'react'
import '../styles/ResultPage.css'
import { hexFromRgb } from '../lib/color/hexFromRgb.js'
import { sortPalette, generatePaletteName } from '../lib/color/sortPalette.js'

function ResultPage({ analysisResult }) {
  const [imageUrls, setImageUrls] = useState([])
  const [isTransitioned, setIsTransitioned] = useState(false)
  const [sparkles, setSparkles] = useState([])
  const [randomTapes, setRandomTapes] = useState([])
  const [randomStickers, setRandomStickers] = useState([])

  // 디버깅: 결과 확인
  console.log('ResultPage - analysisResult:', analysisResult)

  // 클러스터링 결과 구조: { colorPalette, representatives, keyColors (하위 호환) }
  if (!analysisResult || (!analysisResult.colorPalette && !analysisResult.keyColors)) {
    return <div>분석 결과가 없습니다.</div>
  }

  const { colorPalette, representatives } = analysisResult
  console.log('ResultPage - representatives:', representatives)
  console.log('ResultPage - colorPalette:', colorPalette)

  // 컬러 팔레트 정렬 및 이름 생성
  const sortedPalette = colorPalette ? sortPalette(colorPalette, 'auto') : [
    analysisResult.keyColors.colorA,
    analysisResult.keyColors.colorB
  ]

  const paletteName = generatePaletteName(sortedPalette)

  // 팔레트를 hex로 변환
  const paletteColors = sortedPalette.map(rgb => hexFromRgb(rgb))

  console.log('sortedPalette:', sortedPalette)
  console.log('paletteName:', paletteName)
  console.log('paletteColors:', paletteColors)

  // 대표 이미지들의 File 객체에서 URL 생성
  useEffect(() => {
    console.log('useEffect - representatives:', representatives)
    if (representatives && representatives.length > 0) {
      const urls = representatives.map(rep => {
        console.log('Processing rep:', rep, 'has file:', !!rep.file)
        if (rep.file) {
          const url = URL.createObjectURL(rep.file)
          console.log('Created URL:', url)
          return url
        }
        return null
      })
      console.log('All URLs:', urls)
      setImageUrls(urls)
    }

    return () => {
      // Cleanup: URL.revokeObjectURL
      imageUrls.forEach(url => url && URL.revokeObjectURL(url))
    }
  }, [representatives])

  // tape 파일 9개 랜덤 선택
  useEffect(() => {
    const totalTapes = 24 // tape-1.png ~ tape-24.png
    const tapeIndices = Array.from({ length: totalTapes }, (_, i) => i + 1)

    // Fisher-Yates shuffle
    for (let i = tapeIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[tapeIndices[i], tapeIndices[j]] = [tapeIndices[j], tapeIndices[i]]
    }

    // 처음 9개 선택
    setRandomTapes(tapeIndices.slice(0, 9))
  }, [])

  // sticker 파일들 랜덤 배치 (화면 전반, 상단 20% 제외)
  useEffect(() => {
    const totalStickers = 11 // sticker-1.png ~ sticker-11.png
    const generatedStickers = []

    // 11개의 스티커를 화면에 랜덤 배치 (컬러 팔레트 영역 제외)
    for (let i = 1; i <= totalStickers; i++) {
      // sticker-5와 sticker-11은 기본 크기의 1/3, 나머지는 0.5
      const baseScale = (i === 5 || i === 11)
        ? 1 / 3  // 0.33
        : 0.5    // 0.5

      generatedStickers.push({
        id: i,
        number: i,
        top: Math.random() * 60 + 30, // 30% ~ 90% (상단 20% 제외)
        left: Math.random() * 80 + 10, // 10% ~ 90%
        rotation: Math.random() * 360, // 0deg ~ 360deg
        scale: baseScale,
        opacity: 0.7 + Math.random() * 0.3 // 0.7 ~ 1.0
      })
    }

    setRandomStickers(generatedStickers)
  }, [])

  // 초기 팡파레 별 애니메이션
  useEffect(() => {
    const createSparkles = () => {
      const newSparkles = []
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 3

      // 100개의 별 생성 (더 많이)
      for (let i = 0; i < 100; i++) {
        const angle = (Math.PI * 2 * i) / 100
        const distance = 150 + Math.random() * 250
        const tx = Math.cos(angle) * distance
        const ty = Math.sin(angle) * distance
        const duration = 0.6 + Math.random() * 0.5

        newSparkles.push({
          id: i,
          x: centerX,
          y: centerY,
          tx,
          ty,
          duration
        })
      }

      setSparkles(newSparkles)

      // 애니메이션 완료 후 별 제거
      setTimeout(() => {
        setSparkles([])
      }, 1500)
    }

    createSparkles()
  }, [])

  // 2초 후 레이아웃 전환 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioned(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // 다시하기
  const handleRestart = () => {
    window.location.reload()
  }

  // 공유하기
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '2025 Color Recap',
          text: 'Check out my 2025 color palette!',
          url: window.location.href
        })
      } catch (error) {
        console.log('Share failed:', error)
      }
    } else {
      // 폴백: 클립보드 복사
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다!')
    }
  }

  return (
    <div className="result-page">
      {/* Random Stickers - 화면 전반에 배치 */}
      {randomStickers.length > 0 && (
        <div className="random-stickers">
          {randomStickers.map((sticker) => (
            <img
              key={sticker.id}
              src={`/images/sticker-${sticker.number}.png`}
              alt=""
              className="random-sticker"
              style={{
                top: `${sticker.top}%`,
                left: `${sticker.left}%`,
                transform: `rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                opacity: sticker.opacity
              }}
            />
          ))}
        </div>
      )}

      {/* Celebration Sparkles */}
      {sparkles.length > 0 && (
        <div className="celebration-sparkles">
          {sparkles.map((sparkle) => (
            <div
              key={sparkle.id}
              className="celebration-sparkle"
              style={{
                left: sparkle.x,
                top: sparkle.y,
                '--tx': `${sparkle.tx}px`,
                '--ty': `${sparkle.ty}px`,
                animationDuration: `${sparkle.duration}s`
              }}
            />
          ))}
        </div>
      )}

      <header className="result-header">
        <h1 className="result-title">{paletteName}</h1>
        <p className="result-subtitle">
          Your 2025 color palette
        </p>

        {/* Color Palette Bar - 헤더 바로 아래 */}
        <div className="color-palette-bar">
          {paletteColors.map((hex, index) => (
            <div
              key={index}
              className="color-segment"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </header>

      {/* Main Content Container - 전환 애니메이션 적용 */}
      <div className={`result-content ${isTransitioned ? 'transitioned' : ''}`}>
        {/* Representative Images - Polaroid Collage */}
        {representatives && representatives.length > 0 && (
          <div className="representative-section">
            <div className="image-grid">
              {representatives.map((rep, index) => {
                // 랜덤하게 선택된 tape 이미지 사용
                const tapeNumber = randomTapes[index] || 1
                const tapePath = `/images/tape-${tapeNumber}.png`

                return (
                  <div key={index} className="image-item">
                    {/* 테이프 이미지 */}
                    <img
                      src={tapePath}
                      alt=""
                      className="tape-sticker"
                      onError={(e) => {
                        // 이미지 로드 실패시 숨김 (CSS 기본 테이프 사용)
                        e.target.style.display = 'none'
                      }}
                    />
                    <div className="image-wrapper">
                      {imageUrls[index] ? (
                        <img
                          src={imageUrls[index]}
                          alt={`Representative ${index + 1}`}
                          className="representative-image"
                        />
                      ) : (
                        <div className="image-placeholder">
                          Loading...
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 액션 버튼들 (하단에 표시) */}
        {isTransitioned && (
          <div className="action-buttons">
            <button
              className="action-button restart-button"
              onClick={handleRestart}
              aria-label="다시하기"
            >
              ↻
            </button>
            <button
              className="action-button share-button"
              onClick={handleShare}
              aria-label="공유하기"
            >
              ⎋
            </button>
          </div>
        )}
      </div>

      {/* 추가 정보 */}
      <div className="result-footer">
        <p className="result-credit">
          Generated with 2025 Color Recap
        </p>
      </div>

    </div>
  )
}

export default ResultPage
