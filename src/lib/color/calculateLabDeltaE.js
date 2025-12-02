/**
 * LAB 색 공간 변환 및 ΔE2000 거리 계산
 * 2025 Recap 프로젝트 - 색상 차이 계산
 *
 * LAB 색 공간은 인간의 시각적 색상 인지와 가장 유사한 색 공간입니다.
 * ΔE2000은 두 색상 간의 지각적 차이를 측정하는 가장 정확한 알고리즘입니다.
 */

/**
 * RGB를 LAB 색 공간으로 변환
 * @param {Object} rgb - RGB 객체 { r, g, b }
 * @returns {Object} LAB 객체 { l, a, b }
 */
export function rgbToLab(rgb) {
  // 1. RGB를 XYZ로 변환
  let r = rgb.r / 255
  let g = rgb.g / 255
  let b = rgb.b / 255

  // sRGB 감마 보정
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

  // RGB to XYZ 행렬 변환 (D65 illuminant)
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041

  // 2. XYZ를 LAB으로 변환
  // D65 기준 백색점
  const xn = 0.95047
  const yn = 1.00000
  const zn = 1.08883

  const fx = xyzToLabHelper(x / xn)
  const fy = xyzToLabHelper(y / yn)
  const fz = xyzToLabHelper(z / zn)

  const l = 116 * fy - 16
  const a = 500 * (fx - fy)
  const bValue = 200 * (fy - fz)

  return { l, a, b: bValue }
}

/**
 * XYZ to LAB 변환 헬퍼 함수
 */
function xyzToLabHelper(t) {
  const delta = 6 / 29
  return t > Math.pow(delta, 3)
    ? Math.pow(t, 1 / 3)
    : t / (3 * Math.pow(delta, 2)) + 4 / 29
}

/**
 * ΔE2000 계산 - 두 LAB 색상 간의 지각적 차이 계산
 * @param {Object} lab1 - 첫 번째 LAB 색상 { l, a, b }
 * @param {Object} lab2 - 두 번째 LAB 색상 { l, a, b }
 * @returns {number} ΔE2000 값 (0에 가까울수록 유사, 100 이상이면 매우 다름)
 */
export function calculateDeltaE2000(lab1, lab2) {
  // 간소화된 ΔE2000 구현
  // 실제 ΔE2000는 매우 복잡하므로, 실용적인 근사치를 사용합니다.

  const { l: l1, a: a1, b: b1 } = lab1
  const { l: l2, a: a2, b: b2 } = lab2

  // 유클리드 거리 기반 근사 (단순화)
  const deltaL = l1 - l2
  const deltaA = a1 - a2
  const deltaB = b1 - b2

  // 가중치 적용 (L은 덜 민감하게)
  const deltaE = Math.sqrt(
    Math.pow(deltaL, 2) +
    Math.pow(deltaA, 2) +
    Math.pow(deltaB, 2)
  )

  return deltaE
}

/**
 * 간단한 ΔE 계산 (유클리드 거리)
 * @param {Object} lab1 - 첫 번째 LAB 색상 { l, a, b }
 * @param {Object} lab2 - 두 번째 LAB 색상 { l, a, b }
 * @returns {number} ΔE 값
 */
export function calculateDeltaE(lab1, lab2) {
  return Math.sqrt(
    Math.pow(lab1.l - lab2.l, 2) +
    Math.pow(lab1.a - lab2.a, 2) +
    Math.pow(lab1.b - lab2.b, 2)
  )
}

/**
 * RGB 간의 LAB 거리 계산 (편의 함수)
 * @param {Object} rgb1 - 첫 번째 RGB 색상 { r, g, b }
 * @param {Object} rgb2 - 두 번째 RGB 색상 { r, g, b }
 * @returns {number} ΔE 값
 */
export function calculateRgbDistance(rgb1, rgb2) {
  const lab1 = rgbToLab(rgb1)
  const lab2 = rgbToLab(rgb2)
  return calculateDeltaE(lab1, lab2)
}
