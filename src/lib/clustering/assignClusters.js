/**
 * LAB ΔE 거리 기반 클러스터 배정
 * 2025 Recap 프로젝트 - 이미지를 KeyColor A/B 클러스터로 분류
 *
 * 각 이미지의 dominant color와 Top 2 KeyColors (A, B)의 LAB 거리를 계산하여
 * 더 가까운 클러스터로 배정합니다.
 */

import { rgbToLab, calculateDeltaE } from '../color/calculateLabDeltaE.js'

/**
 * 이미지들을 KeyColor A/B 클러스터로 배정
 * @param {Array<ImageWithColors>} images - 이미지 배열 (각 이미지는 dominant colors 포함)
 * @param {Object} keyColorA - Top 1 Key Color { r, g, b }
 * @param {Object} keyColorB - Top 2 Key Color { r, g, b }
 * @returns {Object} { clusterA: [...imageIds], clusterB: [...imageIds] }
 */
export function assignClusters(images, keyColorA, keyColorB) {
  const clusterA = []
  const clusterB = []

  // KeyColors를 LAB로 변환
  const labA = rgbToLab(keyColorA)
  const labB = rgbToLab(keyColorB)

  for (const image of images) {
    const { imageId, dominantColors } = image

    // 이미지의 각 dominant color와 KeyColor A/B의 평균 거리 계산
    const avgDistanceToA = calculateAverageDistance(dominantColors, labA)
    const avgDistanceToB = calculateAverageDistance(dominantColors, labB)

    // Tie-breaker: 거리가 매우 비슷하면 (차이 < 5) 첫 번째 dominant color만 비교
    const diff = Math.abs(avgDistanceToA - avgDistanceToB)

    if (diff < 5 && dominantColors.length > 0) {
      // 첫 번째 dominant color (가장 비중 큰 색상)만으로 판단
      const primaryColor = dominantColors[0]
      const primaryLab = rgbToLab(primaryColor.rgb)
      const distA = calculateDeltaE(primaryLab, labA)
      const distB = calculateDeltaE(primaryLab, labB)

      if (distA < distB) {
        clusterA.push(imageId)
      } else {
        clusterB.push(imageId)
      }
    } else {
      // 평균 거리로 판단
      if (avgDistanceToA < avgDistanceToB) {
        clusterA.push(imageId)
      } else {
        clusterB.push(imageId)
      }
    }
  }

  return { clusterA, clusterB }
}

/**
 * 이미지의 dominant colors와 특정 KeyColor의 평균 LAB 거리 계산
 * @param {Array<DominantColor>} dominantColors - 이미지의 dominant colors
 * @param {Object} keyColorLab - KeyColor의 LAB 값
 * @returns {number} 평균 ΔE 거리
 */
function calculateAverageDistance(dominantColors, keyColorLab) {
  if (dominantColors.length === 0) {
    return Infinity // 색상이 없으면 무한대 거리
  }

  let totalDistance = 0
  let totalWeight = 0

  for (const color of dominantColors) {
    const colorLab = rgbToLab(color.rgb)
    const distance = calculateDeltaE(colorLab, keyColorLab)

    // proportion (비율)을 가중치로 사용 (비율이 높은 색상이 더 중요)
    const weight = color.proportion || 1
    totalDistance += distance * weight
    totalWeight += weight
  }

  return totalDistance / totalWeight
}
