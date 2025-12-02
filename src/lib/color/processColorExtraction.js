/**
 * Color Extraction 통합 처리 함수
 * 2025 Recap 프로젝트 - 색상 분석 메인 파이프라인
 *
 * 여러 이미지 파일을 받아서 Top 2 Key Colors와 분포를 반환합니다.
 */

import { extractDominantColors } from './extractDominantColors.js'
import { selectTop2Colors } from './selectTop2Colors.js'
import { generateColorName } from './generateColorName.js'
import { hexFromRgb } from './hexFromRgb.js'
import { rgbToLab } from './calculateLabDeltaE.js'

/**
 * 여러 이미지 파일에서 색상 분석 수행
 * @param {Array<File>} imageFiles - 업로드된 이미지 파일 배열 (20-30개)
 * @param {Function} onProgress - 진행 상황 콜백 (0-100)
 * @returns {Promise<Object>} ColorExtractionResult
 */
export async function processColorExtraction(imageFiles, onProgress) {
  const totalImages = imageFiles.length

  // 1. 각 이미지에서 dominant colors 추출
  onProgress?.(10)
  const allDominantColors = []

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i]

    try {
      const dominantColors = await extractDominantColors(file, 6)
      allDominantColors.push(dominantColors)

      // 진행률 업데이트 (10% ~ 70%)
      const progress = 10 + ((i + 1) / totalImages) * 60
      onProgress?.(Math.round(progress))
    } catch (error) {
      console.error(`Failed to extract colors from image ${i}:`, error)
      // 에러 발생 시 해당 이미지 스킵
    }
  }

  // 2. Top 2 Key Colors 선정
  onProgress?.(75)
  const [rgb1, rgb2] = selectTop2Colors(allDominantColors)

  // 3. ColorInfo 객체 생성
  const color1 = {
    name: generateColorName(rgb1),
    hex: hexFromRgb(rgb1),
    rgb: rgb1,
    lab: rgbToLab(rgb1),
    weight: 0
  }

  const color2 = {
    name: generateColorName(rgb2),
    hex: hexFromRgb(rgb2),
    rgb: rgb2,
    lab: rgbToLab(rgb2),
    weight: 0
  }

  onProgress?.(85)

  // 4. 전체 색상 분포 생성 (모든 dominant colors)
  const allColorsFlat = allDominantColors.flat()
  const distributionColors = allColorsFlat.map(rgb => ({
    name: generateColorName(rgb),
    hex: hexFromRgb(rgb),
    rgb,
    lab: rgbToLab(rgb),
    weight: 1 / allColorsFlat.length
  }))

  onProgress?.(95)

  // 5. 결과 반환
  const result = {
    top2: [color1, color2],
    distribution: {
      colors: distributionColors,
      totalPixels: allColorsFlat.length
    }
  }

  onProgress?.(100)

  return result
}

/**
 * 단일 이미지에서 간단한 색상 분석 (테스트용)
 * @param {File} imageFile - 이미지 파일
 * @returns {Promise<Array>} dominant colors
 */
export async function analyzeImageColors(imageFile) {
  const dominantRgbs = await extractDominantColors(imageFile, 6)

  return dominantRgbs.map(rgb => ({
    name: generateColorName(rgb),
    hex: hexFromRgb(rgb),
    rgb,
    lab: rgbToLab(rgb)
  }))
}
