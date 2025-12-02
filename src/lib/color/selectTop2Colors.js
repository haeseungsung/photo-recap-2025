/**
 * Top 2 Key Colors 선정 알고리즘
 * 2025 Recap 프로젝트 - 대표 색상 선정
 *
 * 여러 이미지에서 추출된 dominant colors를 기반으로
 * LAB ΔE 거리를 고려하여 가장 대표적인 2개 색상을 선정합니다.
 */

import { rgbToLab, calculateDeltaE } from './calculateLabDeltaE.js'

/**
 * 여러 이미지의 dominant colors에서 Top 2 색상 선정
 * @param {Array<Array>} allDominantColors - 모든 이미지에서 추출된 dominant colors (RGB 배열의 배열)
 * @returns {Array} Top 2 색상 [RGB, RGB]
 */
export function selectTop2Colors(allDominantColors) {
  // 1. 모든 색상을 하나의 배열로 합치고 LAB로 변환
  const allColors = []

  for (const colors of allDominantColors) {
    for (const rgb of colors) {
      const lab = rgbToLab(rgb)
      allColors.push({ rgb, lab, weight: 1 })
    }
  }

  if (allColors.length === 0) {
    // 기본 색상 반환 (에러 방지)
    return [
      { r: 100, g: 100, b: 100 },
      { r: 200, g: 200, b: 200 }
    ]
  }

  if (allColors.length === 1) {
    return [allColors[0].rgb, allColors[0].rgb]
  }

  // 2. 유사한 색상끼리 클러스터링 (LAB 거리 기반)
  const clustered = clusterSimilarColors(allColors, 15) // ΔE < 15인 색상끼리 묶기

  // 3. 클러스터별 대표 색상 계산 (가중 평균)
  const clusterRepresentatives = clustered.map(cluster => {
    const totalWeight = cluster.reduce((sum, c) => sum + c.weight, 0)

    const avgRgb = {
      r: Math.round(cluster.reduce((sum, c) => sum + c.rgb.r * c.weight, 0) / totalWeight),
      g: Math.round(cluster.reduce((sum, c) => sum + c.rgb.g * c.weight, 0) / totalWeight),
      b: Math.round(cluster.reduce((sum, c) => sum + c.rgb.b * c.weight, 0) / totalWeight),
    }

    return {
      rgb: avgRgb,
      lab: rgbToLab(avgRgb),
      weight: totalWeight
    }
  })

  // 4. 각 클러스터에 채도와 명도 정보 추가
  const colorsWithMetrics = clusterRepresentatives.map(color => ({
    ...color,
    saturation: calculateSaturation(color.rgb),
    brightness: calculateBrightness(color.rgb)
  }))

  // 5. 명도가 높은 색상들만 필터링 (명도 > 80)
  const brightColors = colorsWithMetrics.filter(c => c.brightness > 80)

  // 명도가 높은 색상이 2개 미만이면 전체에서 선택
  const candidateColors = brightColors.length >= 2 ? brightColors : colorsWithMetrics

  // 6. 명도 순으로 정렬 (명도가 높은 순)
  candidateColors.sort((a, b) => b.brightness - a.brightness)

  // 7. 첫 번째 색상: 명도가 가장 높은 색상
  const color1 = candidateColors[0]

  // 8. 두 번째 색상: color1과 채도/명도 거리가 가장 먼 색상 찾기
  let color2 = candidateColors[1] || color1
  let maxDistance = 0

  for (let i = 1; i < candidateColors.length; i++) {
    const candidate = candidateColors[i]

    // 채도 차이와 명도 차이의 합으로 거리 계산
    const saturationDiff = Math.abs(color1.saturation - candidate.saturation)
    const brightnessDiff = Math.abs(color1.brightness - candidate.brightness)

    // 정규화된 거리 (0-1 사이 값으로)
    const normalizedSaturationDiff = saturationDiff // 이미 0-1 사이
    const normalizedBrightnessDiff = brightnessDiff / 255 // 0-255 → 0-1

    // 유클리드 거리
    const distance = Math.sqrt(
      normalizedSaturationDiff ** 2 +
      normalizedBrightnessDiff ** 2
    )

    if (distance > maxDistance) {
      maxDistance = distance
      color2 = candidate
    }
  }

  console.log('Selected Color 1:', {
    rgb: color1.rgb,
    saturation: color1.saturation,
    brightness: color1.brightness
  })
  console.log('Selected Color 2:', {
    rgb: color2.rgb,
    saturation: color2.saturation,
    brightness: color2.brightness
  })
  console.log('Distance:', maxDistance)

  return [color1.rgb, color2.rgb]
}

/**
 * RGB 색상의 채도 계산 (HSV 기반)
 * @param {Object} rgb - { r, g, b }
 * @returns {number} 채도 (0-1)
 */
function calculateSaturation(rgb) {
  const max = Math.max(rgb.r, rgb.g, rgb.b)
  const min = Math.min(rgb.r, rgb.g, rgb.b)
  const delta = max - min
  return max === 0 ? 0 : delta / max
}

/**
 * RGB 색상의 명도 계산
 * @param {Object} rgb - { r, g, b }
 * @returns {number} 명도 (0-255)
 */
function calculateBrightness(rgb) {
  return (rgb.r + rgb.g + rgb.b) / 3
}

/**
 * 유사한 색상끼리 클러스터링
 * @param {Array} colors - 색상 배열
 * @param {number} threshold - LAB 거리 임계값
 * @returns {Array<Array>} 클러스터별로 묶인 색상 배열
 */
function clusterSimilarColors(colors, threshold) {
  const clusters = []

  for (const color of colors) {
    let assigned = false

    // 기존 클러스터 중 유사한 클러스터 찾기
    for (const cluster of clusters) {
      const representative = cluster[0] // 첫 번째 색상을 대표로 사용
      const distance = calculateDeltaE(color.lab, representative.lab)

      if (distance < threshold) {
        cluster.push(color)
        assigned = true
        break
      }
    }

    // 유사한 클러스터가 없으면 새 클러스터 생성
    if (!assigned) {
      clusters.push([color])
    }
  }

  return clusters
}

/**
 * 단일 이미지에서 가장 dominant한 색상 1개 선정
 * @param {Array} dominantColors - 이미지에서 추출된 dominant colors (6-8개)
 * @returns {Object} 대표 색상 1개 { r, g, b }
 */
export function selectSingleDominantColor(dominantColors) {
  if (dominantColors.length === 0) {
    return { r: 128, g: 128, b: 128 }
  }

  // 첫 번째 색상을 대표로 사용 (k-means의 첫 번째 클러스터)
  // 추후 개선: 채도, 명도 등을 고려하여 선정
  return dominantColors[0]
}
