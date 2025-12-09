import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/AnalysisLoadingPage.css'

function AnalysisLoadingPage({ selectedFiles, onAnalysisComplete }) {
  const [progress, setProgress] = useState(0)
  const [currentVerbIndex, setCurrentVerbIndex] = useState(0)
  const [placedCards, setPlacedCards] = useState([])
  const cardIdCounter = useRef(0)

  const verbs = ['Analyzing', 'Vibing', 'Pondering', 'Musing', 'Deliberating', 'Manifesting', 'Calculating', 'Dreaming']

  // Pantone 색상 데이터 (더 많은 색상)
  const pantoneColors = [
    { name: 'Viva Magenta', hex: '#BB2649' },
    { name: 'Very Peri', hex: '#6667AB' },
    { name: 'Illuminating', hex: '#F5DF4D' },
    { name: 'Ultimate Gray', hex: '#939597' },
    { name: 'Classic Blue', hex: '#0F4C81' },
    { name: 'Living Coral', hex: '#FF6F61' },
    { name: 'Ultra Violet', hex: '#5F4B8B' },
    { name: 'Greenery', hex: '#88B04B' },
    { name: 'Rose Quartz', hex: '#F7CAC9' },
    { name: 'Serenity', hex: '#92A8D1' },
    { name: 'Marsala', hex: '#955251' },
    { name: 'Radiant Orchid', hex: '#B565A7' },
    { name: 'Emerald', hex: '#009B77' },
    { name: 'Tangerine Tango', hex: '#DD4124' },
    { name: 'Honeysuckle', hex: '#D94F70' },
    { name: 'Future Dusk', hex: '#483C56' },
    { name: 'Aquatic Awe', hex: '#38929A' },
    { name: 'Ray Flower', hex: '#E9D843' },
    { name: 'Sunset Coral', hex: '#E57C6C' },
    { name: 'Crimson Haze', hex: '#9E2B25' },
    { name: 'Electric Lime', hex: '#CCFF00' },
    { name: 'Deep Ocean', hex: '#003366' },
    { name: 'Soft Lilac', hex: '#C8A2C8' },
    { name: 'Neon Mint', hex: '#4FFFB0' },
    { name: 'Warm Sand', hex: '#D2B48C' },
    { name: 'Cyber Grape', hex: '#58427C' },
    { name: 'Matcha Tea', hex: '#B0C485' },
    { name: 'Peach Fuzz', hex: '#FFBE98' },
    { name: 'Galactic Blue', hex: '#2A2A72' },
    { name: 'Solar Orange', hex: '#FF7F50' }
  ]

  // 텍스트 색상 결정 함수
  const getContrastColor = (hex) => {
    const r = parseInt(hex.substring(1, 3), 16)
    const g = parseInt(hex.substring(3, 5), 16)
    const b = parseInt(hex.substring(5, 7), 16)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
    return yiq >= 128 ? 'black' : 'white'
  }

  useEffect(() => {
    // 동사 변경 (1.8초마다)
    const verbInterval = setInterval(() => {
      setCurrentVerbIndex((prev) => (prev + 1) % verbs.length)
    }, 1800)

    // 카드 떨어뜨리기 시작 (0.5초 후)
    const cardStartTimeout = setTimeout(() => {
      const cardInterval = setInterval(() => {
        const randomColor = pantoneColors[Math.floor(Math.random() * pantoneColors.length)]

        // X: 화면 너비 전체 (5vw ~ 95vw)
        const x = Math.random() * 90 + 5
        // Y: 타이틀 아래부터 화면 하단 (25vh ~ 90vh)
        const y = 25 + Math.random() * 65
        // 회전: -45도 ~ 45도
        const rotation = Math.random() * 90 - 45

        setPlacedCards(prev => {
          const newCard = {
            id: cardIdCounter.current++,
            name: randomColor.name,
            hex: randomColor.hex,
            textColor: getContrastColor(randomColor.hex),
            x,
            y,
            rotation,
            delay: 0.3 + (prev.length * 0.05),
            zIndex: 10 + prev.length
          }

          // 최대 15개까지만 유지 (성능 최적화)
          const updated = [...prev, newCard]
          return updated.length > 15 ? updated.slice(-15) : updated
        })
      }, 600) // 0.6초마다 카드 생성 (성능 최적화)

      return () => clearInterval(cardInterval)
    }, 500)

    // 실제 색상 분석 시작
    startColorAnalysis()

    return () => {
      clearInterval(verbInterval)
      clearTimeout(cardStartTimeout)
    }
  }, [])

  const startColorAnalysis = async () => {
    console.log('=== 분석 시작 ===')
    console.log('선택된 파일들:', selectedFiles)

    try {
      const { processClustering } = await import('../lib/clustering/processClustering.js')

      const result = await processClustering(selectedFiles, (progressValue) => {
        console.log('진행률:', progressValue)
        setProgress(progressValue)
      })

      console.log('분석 완료! 결과:', result)

      // 최소 3초 로딩 보장
      const minLoadingTime = 3000
      const elapsed = Date.now()
      const remaining = Math.max(0, minLoadingTime - elapsed)

      setTimeout(() => {
        console.log('결과 페이지로 이동')
        onAnalysisComplete(result)
      }, remaining)

    } catch (error) {
      console.error('=== 색상 분석 실패 ===')
      console.error('에러:', error)
      alert(`색상 분석 중 오류가 발생했습니다.\n\n에러: ${error.message}\n\n다시 시도해주세요.`)
    }
  }

  return (
    <div className="analysis-loading-page">
      {/* Dynamic Header */}
      <header className="loading-header">
        <h1 className="loading-title">
          <div className="title-wrapper">
            <span className="title-im">I'm</span>
            <div className="verb-container">
              <AnimatePresence mode="wait">
                <motion.span
                  key={verbs[currentVerbIndex]}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'circOut' }}
                  className="changing-verb"
                >
                  {verbs[currentVerbIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
          <div className="title-subtitle">
            your 2025 color palette...
          </div>
        </h1>
      </header>

      {/* Falling Color Cards */}
      <main className="falling-cards-container">
        {placedCards.map((card) => (
          <motion.div
            key={card.id}
            initial={{
              y: -800,
              x: `${card.x}vw`,
              rotate: card.rotation + (Math.random() * 60 - 30),
              opacity: 0
            }}
            animate={{
              y: `${card.y}vh`,
              x: `${card.x}vw`,
              rotate: card.rotation,
              opacity: 1
            }}
            transition={{
              duration: 1,
              delay: card.delay,
              type: 'spring',
              damping: 20,
              stiffness: 80,
              mass: 0.8
            }}
            className="color-card"
            style={{
              backgroundColor: card.hex,
              color: card.textColor,
              zIndex: card.zIndex
            }}
          >
            {/* Top Decoration */}
            <div className="card-top">
              <span className="card-year">2025</span>
              <span className="card-tm">TM</span>
            </div>

            {/* Main Content */}
            <div className="card-content">
              <h2 className="card-name">{card.name}</h2>
              <p className="card-hex">{card.hex}</p>
            </div>

            {/* Bottom Decoration */}
            <div className="card-bottom">
              <div className="card-circle" style={{ borderColor: card.textColor }} />
              <div className="card-pantone">
                <span>PANTONE</span>
                <span>Color of the Year</span>
              </div>
            </div>
          </motion.div>
        ))}
      </main>

      {/* Texture Overlay */}
      <div
        className="texture-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  )
}

export default AnalysisLoadingPage
