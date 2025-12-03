import { useState, useEffect } from 'react'
import '../styles/ResultPage.css'
import { hexFromRgb } from '../lib/color/hexFromRgb.js'
import { generateColorName } from '../lib/color/generateColorName.js'

function ResultPage({ analysisResult }) {
  const [imageUrls, setImageUrls] = useState([])
  const [isTransitioned, setIsTransitioned] = useState(false)
  const [sparkles, setSparkles] = useState([])

  // 디버깅: 결과 확인
  console.log('ResultPage - analysisResult:', analysisResult)

  // 클러스터링 결과 구조: { keyColors, representatives, clusterA, clusterB }
  if (!analysisResult || !analysisResult.keyColors) {
    return <div>분석 결과가 없습니다.</div>
  }

  const { keyColors, representatives } = analysisResult
  console.log('ResultPage - representatives:', representatives)
  const color1 = {
    rgb: keyColors.colorA,
    hex: hexFromRgb(keyColors.colorA),
    name: generateColorName(keyColors.colorA)
  }
  const color2 = {
    rgb: keyColors.colorB,
    hex: hexFromRgb(keyColors.colorB),
    name: generateColorName(keyColors.colorB)
  }

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

  return (
    <div className="result-page">
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
        <h1 className="result-title">Your 2025 Color Palette</h1>
        <p className="result-subtitle">
          These are the defining colors of your year
        </p>
      </header>

      {/* Main Content Container - 전환 애니메이션 적용 */}
      <div className={`result-content ${isTransitioned ? 'transitioned' : ''}`}>
        {/* Top 2 Key Colors - Pantone 스타일 */}
        <div className="color-cards">
          {/* Color 1 */}
          <div className="color-card">
            <div
              className="color-swatch"
              style={{ backgroundColor: color1.hex }}
            />
            <div className="color-info">
              <h2 className="color-name">{color1.name}</h2>
              <p className="color-hex">{color1.hex}</p>
            </div>
          </div>

          {/* Color 2 */}
          <div className="color-card">
            <div
              className="color-swatch"
              style={{ backgroundColor: color2.hex }}
            />
            <div className="color-info">
              <h2 className="color-name">{color2.name}</h2>
              <p className="color-hex">{color2.hex}</p>
            </div>
          </div>
        </div>

        {/* Representative Images */}
        {representatives && representatives.length > 0 && (
          <div className="representative-section">
            <div className="image-grid">
              {representatives.map((rep, index) => (
                <div key={index} className="image-item">
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
              ))}
            </div>
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
