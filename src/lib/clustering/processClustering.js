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
      minDeltaE: 15 // 녹색 계열 등 유사한 색상도 잘 잡히도록 조정
    })
    updateProgress()

    // 3. 대표 이미지 선정 (팔레트 색상 포함도 기반)
    // 각 이미지에 대해 가장 가까운 팔레트 색상 찾기
    const paletteLab = colorPalette.map(rgb => rgbToLab(rgb))

    const imageScores = imagesWithColors.map(img => {
      // 팔레트 색상들과 이미지의 dominant colors 간의 유사도 계산
      const score = calculatePaletteMatchScore(img.dominantColors, colorPalette)

      // 이미지의 주요 색상과 가장 가까운 팔레트 색상 찾기
      let bestClusterIndex = 0
      let minTotalDistance = Infinity

      for (let paletteIdx = 0; paletteIdx < colorPalette.length; paletteIdx++) {
        let totalDistance = 0
        for (const colorData of img.dominantColors) {
          const colorLab = rgbToLab(colorData.rgb)
          const deltaE = calculateDeltaE(colorLab, paletteLab[paletteIdx])
          totalDistance += deltaE * colorData.proportion
        }

        if (totalDistance < minTotalDistance) {
          minTotalDistance = totalDistance
          bestClusterIndex = paletteIdx
        }
      }

      return {
        imageId: img.imageId,
        score,
        file: img.file,
        clusterIndex: bestClusterIndex
      }
    })

    // 점수 순으로 정렬
    imageScores.sort((a, b) => b.score - a.score)

    // 전체 이미지의 50% 선택 (최소 4장, 최대 15장)
    const targetCount = Math.max(4, Math.min(15, Math.round(imageFiles.length * 0.5)))

    // 각 팔레트 색상별로 이미지 그룹화
    const imagesByCluster = {}
    for (let i = 0; i < colorPalette.length; i++) {
      imagesByCluster[i] = []
    }

    for (const img of imageScores) {
      imagesByCluster[img.clusterIndex].push(img)
    }

    // 각 클러스터에서 최소 1개씩 선택하되, 남은 자리는 점수 순으로 채움
    const representatives = []
    const usedImages = new Set()

    // 1단계: 각 팔레트 색상에서 최고 점수 이미지 1개씩 선택
    for (let clusterIdx = 0; clusterIdx < colorPalette.length; clusterIdx++) {
      const clusterImages = imagesByCluster[clusterIdx]
      if (clusterImages.length > 0 && representatives.length < targetCount) {
        const bestImage = clusterImages[0] // 이미 점수순 정렬되어 있음
        representatives.push({
          imageId: bestImage.imageId,
          file: bestImage.file,
          score: bestImage.score,
          rank: representatives.length + 1,
          clusterIndex: bestImage.clusterIndex,
          totalScore: bestImage.score
        })
        usedImages.add(bestImage.imageId)
      }
    }

    // 2단계: 남은 자리를 점수 순으로 채움
    for (const img of imageScores) {
      if (representatives.length >= targetCount) break
      if (!usedImages.has(img.imageId)) {
        representatives.push({
          imageId: img.imageId,
          file: img.file,
          score: img.score,
          rank: representatives.length + 1,
          clusterIndex: img.clusterIndex,
          totalScore: img.score
        })
        usedImages.add(img.imageId)
      }
    }

    updateProgress()

    console.log('processClustering - representatives:', representatives)
    console.log('Representative cluster distribution:', representatives.map(r => r.clusterIndex))

    // 4. 최종 결과 구조 생성
    const result = {
      colorPalette, // 5-8개의 색상 팔레트
      representatives, // 대표 이미지 (전체의 50%)
      // 하위 호환성을 위해 기존 필드 유지 (첫 2개 색상)
      keyColors: {
        colorA: colorPalette[0] || { r: 100, g: 100, b: 100 },
        colorB: colorPalette[1] || { r: 200, g: 200, b: 200 }
      }
    }

    console.log('processClustering - final result:', result)
    console.log(`Selected ${representatives.length} out of ${imageFiles.length} images (${Math.round(representatives.length / imageFiles.length * 100)}%)`)
    return result
  } catch (error) {
    console.error('Clustering process failed:', error)
    throw error
  }
}
