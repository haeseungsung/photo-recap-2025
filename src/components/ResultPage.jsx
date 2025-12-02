import '../styles/ResultPage.css'

function ResultPage({ analysisResult }) {
  if (!analysisResult || !analysisResult.top2) {
    return <div>분석 결과가 없습니다.</div>
  }

  const [color1, color2] = analysisResult.top2

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

      {/* 추가 정보 */}
      <div className="result-footer">
        <p className="result-credit">
          🤖 Generated with 2025 Color Recap
        </p>
      </div>
    </div>
  )
}

export default ResultPage
