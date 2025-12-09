import { useState, useEffect } from 'react'
import '../styles/ColorChipModal.css'
import { rgbToHsl } from '../lib/color/sortPalette.js'

function ColorChipModal({ color, onClose }) {
  const [copied, setCopied] = useState(false)

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!color) return null

  const { r, g, b } = color
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
  const rgb = `rgb(${r}, ${g}, ${b})`
  const hsl = rgbToHsl(color)
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="color-preview" style={{ backgroundColor: hex }} />

        <div className="color-formats">
          <div className="color-format-item" onClick={() => handleCopy(hex)}>
            <span className="format-label">HEX</span>
            <span className="format-value">{hex}</span>
          </div>

          <div className="color-format-item" onClick={() => handleCopy(rgb)}>
            <span className="format-label">RGB</span>
            <span className="format-value">{rgb}</span>
          </div>

          <div className="color-format-item" onClick={() => handleCopy(hslString)}>
            <span className="format-label">HSL</span>
            <span className="format-value">{hslString}</span>
          </div>
        </div>

        {copied && (
          <div className="copy-notification">
            Copied to clipboard!
          </div>
        )}
      </div>
    </div>
  )
}

export default ColorChipModal
