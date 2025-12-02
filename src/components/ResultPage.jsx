import { useState, useEffect } from 'react'
import '../styles/ResultPage.css'
import { hexFromRgb } from '../lib/color/hexFromRgb.js'
import { generateColorName } from '../lib/color/generateColorName.js'

function ResultPage({ analysisResult }) {
  const [imageUrls, setImageUrls] = useState([])

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

  return (
    <div className="result-page">
      <header className="result-header">
        <h1 className="result-title">Your 2025 Color Palette</h1>
        <p className="result-subtitle">
          These are the defining colors of your year
        </p>
      </header>

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
          <h2 className="section-title">Your Defining Moments</h2>
          <p className="section-subtitle">
            {representatives.length} photos that best represent your year
          </p>

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
