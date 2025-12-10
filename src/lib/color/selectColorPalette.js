/**
 * Color Palette Selection Algorithm
 * 2025 Recap 프로젝트 - 컬러 팔레트 선정
 *
 * 여러 이미지에서 추출된 dominant colors를 기반으로
 * LAB ΔE 거리를 고려하여 대표적인 5-8개 색상 팔레트를 선정합니다.
 */

import { rgbToLab, calculateDeltaE } from './calculateLabDeltaE.js'

/**
 * 여러 이미지의 dominant colors에서 Color Palette 선정
 * @param {Array<Array>} allDominantColors - 모든 이미지에서 추출된 dominant colors (RGB 배열의 배열)
 * @param {Object} options - 옵션 { paletteSize: 5-8, minDeltaE: 20 }
 * @returns {Array} Color Palette [RGB, RGB, ...] (5-8개)
 */
export function selectColorPalette(allDominantColors, options = {}) {
  const {
    paletteSize = 6, // 기본 팔레트 크기
    minDeltaE = 20 // 색상 간 최소 거리
  } = options

  // 1. 모든 색상을 하나의 배열로 합치고 LAB로 변환
  const allColors = []

  for (const colors of allDominantColors) {
    for (const rgb of colors) {
      const lab = rgbToLab(rgb)
      allColors.push({ rgb, lab, weight: 1 })
    }
  }

  if (allColors.length === 0) {
    // 기본 팔레트 반환 (에러 방지)
    return generateDefaultPalette(paletteSize)
  }

  if (allColors.length < paletteSize) {
    return allColors.map(c => c.rgb)
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

  // 4. 가중치 순으로 정렬 (많이 등장한 색상 우선)
  clusterRepresentatives.sort((a, b) => b.weight - a.weight)

  // 5. 다양성을 고려한 팔레트 선정
  const palette = []
  const candidates = [...clusterRepresentatives]

  // 첫 번째 색상: 가장 빈도가 높은 색상
  palette.push(candidates[0])
  candidates.splice(0, 1)

  // 나머지 색상: 기존 팔레트와 충분히 다르면서 가중치가 높은 색상 선택
  while (palette.length < paletteSize && candidates.length > 0) {
    let bestCandidate = null
    let bestScore = -Infinity

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i]

      // 기존 팔레트와의 최소 거리 계산
      let minDistance = Infinity
      for (const paletteColor of palette) {
        const distance = calculateDeltaE(candidate.lab, paletteColor.lab)
        minDistance = Math.min(minDistance, distance)
      }

      // 점수 = 최소거리 * 가중치 (다양성과 빈도 모두 고려)
      const score = minDistance * Math.log(candidate.weight + 1)

      // 최소 거리 조건을 만족하면서 점수가 가장 높은 후보 선택
      if (minDistance >= minDeltaE && score > bestScore) {
        bestScore = score
        bestCandidate = i
      }
    }

    if (bestCandidate !== null) {
      palette.push(candidates[bestCandidate])
      candidates.splice(bestCandidate, 1)
    } else {
      // 최소 거리 조건을 만족하는 후보가 없으면 반복 중단
      break
    }
  }

  // 6. 팔레트가 paletteSize보다 작으면 가중치 순으로 추가
  while (palette.length < paletteSize && candidates.length > 0) {
    palette.push(candidates[0])
    candidates.splice(0, 1)
  }

  console.log(`Selected ${palette.length} colors for palette:`)
  palette.forEach((color, i) => {
    console.log(`  Color ${i + 1}:`, color.rgb, 'Weight:', color.weight)
  })

  return palette.map(c => c.rgb)
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
 * 기본 팔레트 생성 (에러 방지용)
 * @param {number} size - 팔레트 크기
 * @returns {Array} 기본 컬러 팔레트
 */
function generateDefaultPalette(size) {
  const defaultColors = [
    { r: 239, g: 68, b: 68 },   // Red
    { r: 249, g: 115, b: 22 },  // Orange
    { r: 234, g: 179, b: 8 },   // Yellow
    { r: 34, g: 197, b: 94 },   // Green
    { r: 59, g: 130, b: 246 },  // Blue
    { r: 147, g: 51, b: 234 },  // Purple
    { r: 236, g: 72, b: 153 },  // Pink
    { r: 107, g: 114, b: 128 }  // Gray
  ]

  return defaultColors.slice(0, size)
}
