import { useState, useEffect } from 'react'
import '../styles/AnalysisLoadingPage.css'

function AnalysisLoadingPage({ selectedFiles, onAnalysisComplete }) {
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState('')

  const messages = [
    "Analyzing your colors now…",
    "Scanning your moments…",
    "Extracting key tones…",
    "Finding your 2025 palette…"
  ]

  useEffect(() => {
    // 메시지 순차 변경
    let messageIndex = 0
    const messageInterval = setInterval(() => {
      setCurrentMessage(messages[messageIndex])
      messageIndex = (messageIndex + 1) % messages.length
    }, 2000)

    // 실제 색상 분석 시작
    startColorAnalysis()

    return () => clearInterval(messageInterval)
  }, [])

  const startColorAnalysis = async () => {
    try {
      // processClustering import (클러스터링 + 대표 이미지 선정 포함)
      const { processClustering } = await import('../lib/clustering/processClustering.js')

      // 클러스터링 분석 실행 (색상 추출 + 클러스터링 + 대표 이미지 선정)
      const result = await processClustering(selectedFiles, (progressValue) => {
        setProgress(progressValue)
      })

      // 최소 3초 로딩 보장
      const minLoadingTime = 3000
      const elapsed = Date.now()
      const remaining = Math.max(0, minLoadingTime - elapsed)

      setTimeout(() => {
        onAnalysisComplete(result)
      }, remaining)

    } catch (error) {
      console.error('색상 분석 실패:', error)
      // 에러 처리 - 사용자에게 알림
      alert('색상 분석 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="analysis-loading-page">
      {/* Color Picker UI */}
      <div className="color-picker-container">
        <div className="color-picker">
          {/* 20x10 색상 매트릭스 */}
          <div className="color-matrix">
            {Array.from({ length: 200 }).map((_, index) => (
              <div
                key={index}
                className="color-cell"
                style={{
                  backgroundColor: `hsl(${(index % 20) * 18}, ${50 + (Math.floor(index / 20) * 5)}%, ${30 + (Math.floor(index / 20) * 5)}%)`
                }}
              />
            ))}
          </div>

          {/* Auto-moving selector */}
          <div
            className="color-selector"
            style={{
              left: `${(progress % 20) * 5}%`,
              top: `${Math.floor(progress / 20) % 10 * 10}%`
            }}
          />
        </div>
      </div>

      {/* Progress & Message */}
      <div className="analysis-info">
        <div className="analysis-progress">
          <div
            className="analysis-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="analysis-message">{currentMessage}</p>
        <p className="analysis-percentage">{Math.round(progress)}%</p>
      </div>
    </div>
  )
}

export default AnalysisLoadingPage
