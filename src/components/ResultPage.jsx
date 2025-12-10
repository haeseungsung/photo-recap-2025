import { useState, useEffect, useMemo } from 'react'
import '../styles/ResultPage.css'
import { hexFromRgb } from '../lib/color/hexFromRgb.js'
import { sortPalette, generatePaletteName } from '../lib/color/sortPalette.js'
import ColorChipModal from './ColorChipModal.jsx'

function ResultPage({ analysisResult }) {
  const [imageUrls, setImageUrls] = useState([])
  const [hoveredColorIndex, setHoveredColorIndex] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)

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

  // Combine processed image data with colorIndex
  const collageItems = useMemo(() => {
    if (!representatives || representatives.length === 0) return []

    const items = representatives.map((rep, index) => {
      // clusterIndex는 팔레트 배열의 인덱스와 일치해야 함
      const colorIndex = rep.clusterIndex ?? 0
      return {
        id: rep.id || index,
        url: imageUrls[index],
        colorIndex,
        score: rep.totalScore || 0
      }
    }).filter(item => item.url)

    console.log('Collage items with colorIndex:', items)
    console.log('Number of palette colors:', paletteColors.length)
    return items
  }, [representatives, imageUrls, paletteColors])

  // "Jittered Grid" Layout Calculation
  const layoutStyles = useMemo(() => {
    const count = collageItems.length
    if (count === 0) return []

    // Determine grid dimensions based on aspect ratio
    const isPortrait = window.innerHeight > window.innerWidth
    const cols = isPortrait ? 3 : 5
    const rows = Math.ceil(count / cols)

    return collageItems.map((_, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)

      // Base grid position (in percentages)
      // Leaving space at the bottom-left for the palette
      // Available area: 0-60% height (top 60% of screen)
      const sectionHeight = 60 / rows
      const sectionWidth = 100 / cols

      const baseX = col * sectionWidth + (sectionWidth / 2)
      const baseY = row * sectionHeight + (sectionHeight / 2)

      // Add "Jitter" (Random offset within the cell)
      // Constrain jitter to keep images in safe zone (not over palette)
      const jitterX = (Math.random() - 0.5) * (sectionWidth * 0.8)
      const jitterY = (Math.random() - 0.5) * (sectionHeight * 0.8)

      // Ensure images stay in top 60% of screen
      const finalY = Math.min(baseY + jitterY, 55)

      // Random Rotation (-15 to 15 degrees)
      const rotation = (Math.random() - 0.5) * 30

      return {
        left: `${baseX + jitterX}%`,
        top: `${finalY}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        zIndex: index + 10,
      }
    })
  }, [collageItems])

  // 다시하기
  const handleRestart = () => {
    window.location.reload()
  }

  return (
    <div className="result-page">
      {/* Background Subtle Texture */}
      <div className="subtle-texture" />

      {/* Header Actions */}
      <div className="header-actions">
        <button onClick={handleRestart} className="new-board-button">
          New Moodboard
        </button>
      </div>

      {/* Main Collage Container */}
      <div className="collage-container">
        {collageItems.map((item, idx) => {
          const style = layoutStyles[idx]

          // cases처럼 간단하게: 호버한 컬러와 이미지의 컬러가 다르면 dim
          const isDimmed = hoveredColorIndex !== null && item.colorIndex !== hoveredColorIndex

          return (
            <div
              key={item.id}
              className={`collage-item ${isDimmed ? 'dimmed' : ''}`}
              style={{
                left: style.left,
                top: style.top,
                transform: isDimmed
                  ? `${style.transform} scale(0.95)`
                  : `${style.transform} scale(1.0)`,
                zIndex: isDimmed ? 5 : style.zIndex,
              }}
            >
              <img
                src={item.url}
                alt="Collage item"
                draggable={false}
              />
            </div>
          )
        })}
      </div>

      {/* Palette Section - Bottom Left */}
      <div className="palette-section">
        <div className="palette-content">

          {/* Keywords & Title */}
          <div className="palette-header">
            <h2 className="palette-title">
              {paletteName}
            </h2>
          </div>

          {/* Color Palette - Spaced out, no border */}
          <div className="color-palette">
            {paletteColors.map((color, idx) => (
              <div
                key={idx}
                className={`color-circle ${hoveredColorIndex === idx ? 'hovered' : ''}`}
                onMouseEnter={() => {
                  console.log(`Hovering color index ${idx}`)
                  console.log('Items with this colorIndex:', collageItems.filter(item => item.colorIndex === idx))
                  setHoveredColorIndex(idx)
                }}
                onMouseLeave={() => {
                  console.log('Stopped hovering')
                  setHoveredColorIndex(null)
                }}
                onClick={() => setSelectedColor(sortedPalette[idx])}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Palette Footer Label */}
          <div className="palette-label">
            Your 2025 Color Palette
          </div>
        </div>
      </div>

      {/* Color Chip Modal */}
      {selectedColor && (
        <ColorChipModal
          color={selectedColor}
          onClose={() => setSelectedColor(null)}
        />
      )}

    </div>
  )
}

export default ResultPage
