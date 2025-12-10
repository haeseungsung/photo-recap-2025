/**
 * KeyColor Presence Score 계산
 * 2025 Recap 프로젝트 - 이미지별 KeyColor 포함 비율 계산
 *
 * 각 이미지의 dominant colors가 Top 2 KeyColors와 얼마나 유사한지 계산하여
 * 대표 이미지 선정에 사용합니다.
 */

import { rgbToLab, calculateDeltaE } from '../color/calculateLabDeltaE.js'

/**
 * 이미지별 KeyColor A/B 포함 점수 계산
 * @param {Array<ImageWithColors>} images - 이미지 배열
 * @param {Object} keyColorA - Top 1 Key Color { r, g, b }
 * @param {Object} keyColorB - Top 2 Key Color { r, g, b }
 * @returns {Array<Object>} 각 이미지의 score 배열
 */
export function calculateKeyColorScores(images, keyColorA, keyColorB) {
  const labA = rgbToLab(keyColorA)
  const labB = rgbToLab(keyColorB)

  return images.map(image => {
    const { imageId, dominantColors } = image

    let scoreA = 0
    let scoreB = 0

    // 각 dominant color에 대해 KeyColor A/B와의 유사도 계산
    for (const color of dominantColors) {
      const colorLab = rgbToLab(color.rgb)
      const proportion = color.proportion || 1 / dominantColors.length

      // ΔE 거리 계산
      const distanceA = calculateDeltaE(colorLab, labA)
      const distanceB = calculateDeltaE(colorLab, labB)

      // 거리를 유사도로 변환 (거리가 가까울수록 높은 점수)
      // ΔE < 20: 매우 유사, ΔE < 50: 유사, ΔE >= 50: 다름
      const similarityA = calculateSimilarity(distanceA)
      const similarityB = calculateSimilarity(distanceB)

      // 비율 × 유사도로 가중 점수 계산
      scoreA += proportion * similarityA
      scoreB += proportion * similarityB
    }

    return {
      imageId,
      scoreA,
      scoreB,
      totalScore: scoreA + scoreB
    }
  })
}

/**
 * ΔE 거리를 유사도 점수로 변환
 * @param {number} deltaE - LAB ΔE 거리
 * @returns {number} 유사도 점수 (0-1)
 */
function calculateSimilarity(deltaE) {
  // ΔE가 작을수록 높은 점수
  // ΔE = 0  → similarity = 1.0
  // ΔE = 20 → similarity = 0.5
  // ΔE = 50 → similarity = 0.1
  // ΔE >= 100 → similarity = 0

  if (deltaE >= 100) return 0
  if (deltaE <= 0) return 1

  // Exponential decay 함수
  // similarity = e^(-deltaE / 30)
  return Math.exp(-deltaE / 30)
}
