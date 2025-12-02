/**
 * RGB를 HEX 코드로 변환
 * 2025 Recap 프로젝트 - 색상 변환 유틸리티
 */

import type { RGB } from '../types/ColorExtractionResult'

/**
 * RGB 값을 HEX 문자열로 변환
 * @param rgb - RGB 객체 { r, g, b }
 * @returns HEX 코드 문자열 (예: "#FF6B6B")
 */
export function hexFromRgb(rgb: RGB): string {
  const { r, g, b } = rgb

  // RGB 값을 0-255 범위로 클램핑
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)))

  const rHex = clamp(r).toString(16).padStart(2, '0')
  const gHex = clamp(g).toString(16).padStart(2, '0')
  const bHex = clamp(b).toString(16).padStart(2, '0')

  return `#${rHex}${gHex}${bHex}`.toUpperCase()
}

/**
 * HEX 문자열을 RGB 객체로 변환
 * @param hex - HEX 코드 문자열 (예: "#FF6B6B" 또는 "FF6B6B")
 * @returns RGB 객체
 */
export function rgbFromHex(hex: string): RGB {
  // # 제거
  const cleanHex = hex.replace('#', '')

  // 3자리 HEX를 6자리로 확장 (예: "F0A" -> "FF00AA")
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex

  const r = parseInt(fullHex.substring(0, 2), 16)
  const g = parseInt(fullHex.substring(2, 4), 16)
  const b = parseInt(fullHex.substring(4, 6), 16)

  return { r, g, b }
}
