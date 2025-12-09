/**
 * Clustering Pipeline
 * 2025 Recap 프로젝트 - 클러스터링 전체 파이프라인
 *
 * 1. 이미지별 dominant colors 추출
 * 2. Color Palette (5-8개) 선정
 * 3. 대표 이미지 4~6장 선정
 */

import { extractDominantColors } from '../color/extractDominantColors.js'
import { selectColorPalette } from '../color/selectColorPalette.js'
import { rgbToLab, calculateDeltaE } from '../color/calculateLabDeltaE.js'

/**
 * 이미지의 dominant colors와 color palette 간의 매칭 점수 계산
 * @param {Array} dominantColors - 이미지의 dominant colors (with proportion)
 * @param {Array} palette - color palette (RGB 배열)
 * @returns {number} 매칭 점수 (0-100)
 */
function calculatePaletteMatchScore(dominantColors, palette) {
  const paletteLab = palette.map(rgb => rgbToLab(rgb))
  let totalScore = 0

  for (const colorData of dominantColors) {
    const colorLab = rgbToLab(colorData.rgb)

    // 팔레트에서 가장 가까운 색상과의 거리 찾기
    let minDeltaE = Infinity
    for (const pLab of paletteLab) {
      const deltaE = calculateDeltaE(colorLab, pLab)
      minDeltaE = Math.min(minDeltaE, deltaE)
    }

    // 거리가 가까울수록 높은 점수 (proportion으로 가중치)
    // deltaE가 0이면 100점, 50이면 0점
    const similarity = Math.max(0, 100 - minDeltaE * 2)
    totalScore += similarity * colorData.proportion
  }

  return totalScore
}

/**
 * 클러스터링 전체 프로세스 실행
 * @param {Array<File>} imageFiles - 업로드된 이미지 파일 배열
 * @param {Function} onProgress - 진행률 콜백 (0-100)
 * @returns {Promise<ClusterResult>} 클러스터링 결과
 */
export async function processClustering(imageFiles, onProgress = () => {}) {
  const totalSteps = imageFiles.length + 4 // 이미지 개수 + 4개 주요 단계
  let currentStep = 0

  const updateProgress = () => {
    currentStep++
    onProgress(Math.round((currentStep / totalSteps) * 100))
  }

  try {
    // 1. 각 이미지에서 dominant colors 추출 (K-means 클러스터링)
    onProgress(0)
    const imagesWithColors = []

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const dominantColors = await extractDominantColors(file, 6)

      // dominant colors에 proportion 정보 추가 (임시로 균등 분배)
      // 추후 K-means 클러스터 크기 기반으로 개선 가능
      const colorsWithProportion = dominantColors.map(rgb => ({
        rgb,
        proportion: 1 / dominantColors.length
      }))

      imagesWithColors.push({
        imageId: file.name, // File name을 ID로 사용
        file: file, // 원본 파일 참조 유지
        dominantColors: colorsWithProportion
      })

      updateProgress()
    }

    // 2. 모든 이미지의 dominant colors에서 Color Palette 선정 (5-8개)
    const allDominantColors = imagesWithColors.map(img => img.dominantColors.map(c => c.rgb))
    const colorPalette = selectColorPalette(allDominantColors, {
      paletteSize: 6,
      minDeltaE: 20
    })
    updateProgress()

    // 3. 대표 이미지 선정 (팔레트 색상 포함도 기반)
    // 각 이미지에 대해 팔레트 색상과의 유사도 점수 계산
    const imageScores = imagesWithColors.map(img => {
      // 팔레트 색상들과 이미지의 dominant colors 간의 유사도 계산
      const score = calculatePaletteMatchScore(img.dominantColors, colorPalette)
      return {
        imageId: img.imageId,
        score,
        file: img.file
      }
    })

    // 점수 순으로 정렬하고, 임계값 이상인 모든 이미지를 포함
    imageScores.sort((a, b) => b.score - a.score)

    // 점수가 높은 순으로 상위 9개만 선택
    const MAX_REPRESENTATIVES = 9
    const representatives = imageScores
      .slice(0, MAX_REPRESENTATIVES)
      .map((img, index) => ({
        imageId: img.imageId,
        file: img.file,
        score: img.score,
        rank: index + 1
      }))

    updateProgress()

    console.log('processClustering - representatives:', representatives)

    // 4. 최종 결과 구조 생성
    const result = {
      colorPalette, // 5-8개의 색상 팔레트
      representatives, // 대표 이미지 9장
      // 하위 호환성을 위해 기존 필드 유지 (첫 2개 색상)
      keyColors: {
        colorA: colorPalette[0] || { r: 100, g: 100, b: 100 },
        colorB: colorPalette[1] || { r: 200, g: 200, b: 200 }
      }
    }

    console.log('processClustering - final result:', result)
    return result
  } catch (error) {
    console.error('Clustering process failed:', error)
    throw error
  }
}
